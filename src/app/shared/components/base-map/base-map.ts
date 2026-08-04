import { CommonModule } from '@angular/common';
import {
  AfterViewInit,
  Component,
  computed,
  effect,
  ElementRef,
  HostListener,
  inject,
  OnDestroy,
  OnInit,
  output,
  signal,
  ViewChild,
  viewChildren,
  WritableSignal,
} from '@angular/core';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { MatIcon } from '@angular/material/icon';
import {
  BehaviorSubject,
  catchError,
  combineLatest,
  EMPTY,
  filter,
  finalize,
  first,
  forkJoin,
  map,
  Subject,
  take,
  takeUntil,
  tap,
} from 'rxjs';
import { TargetXY } from 'src/app/core/directives/draggable';
import { StallData } from 'src/app/core/interfaces/stall.interface';
import { ExpoStateService } from 'src/app/core/services/state/expo-state-service';
import { LeftSidebarService } from 'src/app/core/services/state/left-sidebar-service';
import { SelectStallService } from 'src/app/core/services/state/select-stall-service';
import { StallMapService } from 'src/app/core/services/state/stall-map-service';
import { StallService } from 'src/app/core/services/state/stall-service';
import { UiStateService } from 'src/app/core/services/state/ui-state-service';
import { TooltipModule } from 'primeng/tooltip';
import { Router } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { MobileDrawerService } from 'src/app/core/services/state/mobile-drawer-service';

@Component({
  selector: 'app-base-map',
  imports: [CommonModule, MatIcon, ButtonModule, TooltipModule],
  templateUrl: './base-map.html',
  styleUrl: './base-map.scss',
})
export class BaseMap implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('mapImage') mapImage!: ElementRef<HTMLImageElement>;
  @ViewChild('mapContainer') mapContainer!: ElementRef<HTMLDivElement>;
  @ViewChild('mapContent') mapContent!: ElementRef<HTMLDivElement>;
  zoneElements = viewChildren<ElementRef<HTMLDivElement>>('zoneLabel');

  onDragging = output<boolean>();

  private _stallMapService = inject(StallMapService);
  private _uiStateService = inject(UiStateService);
  private _stallService = inject(StallService);
  private _selectStallService = inject(SelectStallService);
  private _leftSidebarService = inject(LeftSidebarService);
  private _mobileDrawerService = inject(MobileDrawerService);
  private _expoStateService = inject(ExpoStateService);
  private _router = inject(Router);

  isMobile: WritableSignal<boolean> = signal<boolean>(false);
  isInitialLoading: WritableSignal<boolean> = signal<boolean>(true);
  isInitialError: WritableSignal<boolean> = signal<boolean>(false);
  errorMsg = '';

  mapWidth = signal<number>(0);
  mapHeight = signal<number>(0);

  imgWidth = signal<number>(0);
  imgHeight = signal<number>(0);

  // 縮放、拖曳
  // 地圖狀態 signal
  pan = signal<{ x: number; y: number }>({ x: 0, y: 0 });
  scale = signal(1);
  maxScale = toSignal(
    forkJoin([
      this._expoStateService.desktopMapScaleMax$.pipe(
        filter((val) => val > 0),
        take(1),
      ),
      this._expoStateService.mobileMapScaleMax$.pipe(
        filter((val) => val > 0),
        take(1),
      ),
    ]).pipe(
      map(([desktop, mobile]) => {
        return this._uiStateService.isMobile() ? mobile : desktop;
      }),
    ),
    { initialValue: 3 },
  );
  focusScale = toSignal(
    forkJoin([
      this._expoStateService.desktopMapScaleFocus$.pipe(
        filter((val) => val > 0),
        take(1),
      ),
      this._expoStateService.mobileMapScaleFocus$.pipe(
        filter((val) => val > 0),
        take(1),
      ),
    ]).pipe(
      map(([desktop, mobile]) => {
        return this._uiStateService.isMobile() ? mobile : desktop;
      }),
    ),
    { initialValue: 3 },
  );

  scale$ = toObservable(this.scale);

  // 組合出單一流暢的 transform 字串 (由 GPU 直接處理)
  isDragging = false;
  private startPointer = { x: 0, y: 0 };
  private startPan = { x: 0, y: 0 };
  private rafId: number | null = null;

  mapImgSrc = toSignal(this._expoStateService.mapImageUrl$.pipe(filter((url) => !!url)), {
    initialValue: '',
  });
  _mapImgLoaded = new BehaviorSubject<boolean>(false);
  mapImgLoaded$ = this._mapImgLoaded.asObservable();
  mapImgLoaded = toSignal(this._mapImgLoaded);

  // 攤位區域定義
  stallZoneDef = toSignal(
    this._stallService.stallZoneDef$.pipe(
      map((def) => {
        return Array.from(def.values() ?? []);
      }),
    ),
  );

  // 攤位圖圖片比例
  private imageHeightToWidthRatio = signal<number>(0);
  imageAspectRatio = computed(() => {
    const ratio = this.imageHeightToWidthRatio();
    // Provide the calculated width/height ratio, or a default 1/1 square until the image loads.
    return ratio > 0 ? 1 / ratio : 1;
  });

  // 自動定位置中
  autoFocusing = signal<boolean>(false);

  // mobile 攤位資訊高度
  mobileStallInfoDefaultH = 0;

  // 宣告一個儲存監聽器的變數
  private resizeObserver?: ResizeObserver;

  // sticky區域標示
  stallZoneDefMap = toSignal(this._stallService.stallZoneDef$);
  anchorZones = computed(() => {
    return (this.stallZoneDef() ?? []).filter((zone) => zone.groupDef.showAnchor);
  });
  _zoneElLoaded = new Subject<boolean>();
  zoneElLoaded$ = this._zoneElLoaded.asObservable();

  isAtRoutingPage = toSignal(this._uiStateService.isAtRoutingPage$);

  constructor() {
    effect(() => {
      if (this.zoneElements().length > 0) {
        this._zoneElLoaded.next(true);
      }
    });
  }

  ngOnInit() {
    this.scale$.subscribe((val) => {
      this._stallMapService.mapContentScale = val;
    });

    if (this._uiStateService.isPlatformBrowser()) {
      const vH = window.visualViewport?.height;
      const mobileStallInfoDefaultH = vH ? vH * 0.5 : 300;
      this.mobileStallInfoDefaultH = this._uiStateService.isMobile() ? mobileStallInfoDefaultH : 0;
    }

    this._mapImgLoaded.pipe(first((val) => !!val)).subscribe(() => {
      this._stallMapService.mapImage = this.mapImage.nativeElement;
      this._stallMapService.mapContainer = this.mapContainer.nativeElement;
      this._stallMapService.mapContent = this.mapContent.nativeElement;

      requestAnimationFrame(() => {
        const w = this.mapContent.nativeElement.offsetWidth;
        const h = this.mapContent.nativeElement.offsetHeight;
        this.mapWidth.set(w);
        this.mapHeight.set(h);
        this._stallMapService.mapContentWH = {
          w,
          h,
        };

        const viewportEl = this.mapContainer?.nativeElement;
        if (viewportEl) {
          this.resizeObserver?.observe(viewportEl);
        }

        const x = (viewportEl.offsetWidth - w) / 2;
        const y = (viewportEl.offsetHeight - h) / 2;
        this._setPosition({ x, y });
      });
    });

    combineLatest([this.mapImgLoaded$, this.zoneElLoaded$])
      .pipe(
        filter((res) => res[0] && res[1]),
        take(1),
      )
      .subscribe(() => {
        requestAnimationFrame(() => {
          const x = (this.mapContainer?.nativeElement.offsetWidth - this.mapWidth()) / 2;
          const y = (this.mapContainer?.nativeElement.offsetHeight - this.mapHeight()) / 2;
          this.updateStickyZones(x, y, 1, this.autoFocusing());
        });
      });

    this._stallMapService.focus$.pipe(filter((val) => !!val)).subscribe((stallId) => {
      const stallData = this._stallService.findStall(stallId);

      this.autoFocusing.set(true);
      requestAnimationFrame(() => {
        stallData && this.focus(stallData);
        setTimeout(() => {
          this.autoFocusing.set(false);
        }, 300);
      });
    });

    // 建立監聽器
    if (this._uiStateService.isPlatformBrowser()) {
      this.resizeObserver = new ResizeObserver((entries) => {
        for (let entry of entries) {
          // 当 viewport 大小改變時，立即觸發重新計算
          const w = this.mapContent.nativeElement.offsetWidth;
          const h = this.mapContent.nativeElement.offsetHeight;
          this.mapWidth.set(w);
          this.mapHeight.set(h);
          this._stallMapService.mapContentWH = {
            w,
            h,
          };
          this.updateStickyZones(this.pan().x, this.pan().y, this.scale(), this.autoFocusing());
        }
      });
    }

    // 根據牌卡高度調整 focus icon
    this._mobileDrawerService.drawer$
      .pipe(
        tap((drawer) => {
          if (drawer) {
            const height = drawer.drawerHeight;
            this.focusBottomPx.set(height);
          } else {
            this.focusBottomPx.set(20);
          }
        }),
      )
      .subscribe();
  }
  focusBottomPx = signal(20);

  ngAfterViewInit() {
    this.runApp();
  }

  ngOnDestroy() {
    this.resizeObserver?.disconnect();
  }

  /**
   * 當地圖 Pan 或 Zoom 觸發時，呼叫此方法更新標籤位置
   * @param tx 地圖當前的 transformX (px)
   * @param ty 地圖當前的 transformY (px)
   * @param scale 地圖當前的縮放比例
   */
  updateStickyZones(tx: number, ty: number, scale: number, isAnimating: boolean) {
    const viewportEl = this.mapContainer?.nativeElement;
    const labels = this.zoneElements();

    if (!viewportEl || labels.length === 0) return;

    // 1. 取得可視範圍尺寸與原始地圖設計圖基準尺寸
    const viewW = viewportEl.clientWidth;
    const viewH = viewportEl.clientHeight;

    const baseMapWidth = this.mapWidth();
    const baseMapHeight = this.mapHeight();

    // 2. 算式簡化：基於可視範圍寬度與 scale 動態計算標籤大小與字型
    const baseSize = 16;
    const baseFontSize = 8;
    const currentFontSize = (baseFontSize / 1200) * viewW * scale;
    const currentSize = (baseSize / 1200) * viewW * scale;
    const radius = currentSize / 2; // 半徑：用來將中心點對齊

    // 安全邊距 Padding
    const paddingR = 0;
    const paddingL = 0;
    const paddingT = radius / 2;
    const paddingB = 0;

    // 3. 計算 Sticky 鎖定極限邊界 (可視範圍內絕對 px)
    const minX = paddingL + radius;
    const maxX = viewW - paddingR - radius;
    const minY = paddingT + radius;
    const maxY = viewH - paddingB - radius;

    let maxZoneIdx = -1;
    // 當 autoFocusing 為 true 時啟用 300ms transition，拖曳時 (false) 則設為 none
    const transitionStyle = isAnimating ? 'transform 300ms cubic-bezier(0, 0, 0.2, 1)' : 'none';

    // 4. 計算並更新每一個 Sticky 標籤位置
    labels.forEach((labelRef, idx) => {
      const el = labelRef.nativeElement;
      const zoneName = el.getAttribute('data-zone');
      const zoneData = this.stallZoneDefMap()?.get(zoneName ?? '');

      if (!zoneData) return;

      const region = zoneData.groupDef.boundingBox; // 假設格式為 { top, left, right, bottom } (百分比)

      if (region) {
        const regionScreenLeft = tx + (region.left / 100) * baseMapWidth * scale;
        const regionScreenRight = tx + (region.right / 100) * baseMapWidth * scale;
        const regionScreenTop = ty + (region.top / 100) * baseMapHeight * scale;
        const regionScreenBottom = ty + (region.bottom / 100) * baseMapHeight * scale;

        // 判斷 Region 矩形與 Viewport 矩形 (0, 0, viewW, viewH) 是否有交集
        const isRegionInView =
          regionScreenRight > 0 &&
          regionScreenLeft < viewW &&
          regionScreenBottom > 0 &&
          regionScreenTop < viewH;

        // 設定背景色：出現於視窗內設為 Highlight 顏色，反之為淺灰色
        if (isRegionInView) {
          el.style.backgroundColor = '#000'; // 高亮顏色 (例如 Highlight 藍)
          el.style.color = '#ffffff';
        } else {
          el.style.backgroundColor = '#99a1af'; // 淺灰色 (Gray-200)
          el.style.color = '#ffffff'; // 灰色文字
        }
      }

      // 算出該點在原始 100% 未縮放地圖上的 px 座標
      const originalX = (zoneData.groupDef.anchorRect.left / 100) * baseMapWidth;
      const originalY = (zoneData.groupDef.anchorRect.top / 100) * baseMapHeight;

      // [核心修正] 在 transform-origin: 0 0 下，點位在地圖畫布上的螢幕絕對座標
      const targetX = tx + originalX * scale;
      const targetY = ty + originalY * scale;

      // 進行邊界鎖定 (Clamp)
      const currentX = Math.max(minX, Math.min(maxX, targetX));
      const currentY = Math.max(minY, Math.min(maxY, targetY));

      // 對齊中心點
      const finalX = currentX - radius;
      const finalY = currentY - radius;

      // 套用 Transform 位移與向量尺寸
      el.style.transition = transitionStyle;

      // 套用位移
      el.style.transform = `translate(${finalX}px, ${finalY}px)`;
      el.style.width = `${currentSize}px`;
      el.style.height = `${currentSize}px`;
      el.style.fontSize = `${currentFontSize}px`;

      // 處理分排與重疊隱藏邏輯
      if (idx < 3 || idx >= 36) {
        return;
      }

      if (zoneName === 'C' || zoneName === 'T') {
        maxZoneIdx = -1;
      }

      // 當頂部 Anchor 貼齊上邊界時的遮蔽優先級判斷
      if (maxZoneIdx === -1 && finalY <= minY) {
        maxZoneIdx = idx;
      }

      if (maxZoneIdx >= 0 && idx > maxZoneIdx) {
        el.style.display = 'none';
      } else {
        el.style.display = '';
      }
    });
  }

  runApp() {
    if (this._uiStateService.isPlatformBrowser()) {
      // To enable debug borders, add `?debug=true` to the URL.
      const urlParams = new URLSearchParams(window.location.search);
      if (urlParams.get('debug') === 'true') {
        this.mapContainer.nativeElement.classList.add('debug-mode');
      }
    }

    // --- Asynchronous Resource Loading ---
    forkJoin([
      this._stallService.fetchEnd$.pipe(
        first((val) => !!val),
        map(() => {
          return this._stallService.allStalls;
        }),
      ),
      this._mapImgLoaded,
    ])
      .pipe(
        catchError((error) => {
          console.error('Failed to initialize app:', error);
          this.isInitialLoading.set(false);
          this.isInitialError.set(true);
          this.errorMsg = '地圖或資料載入失敗，請重新整理頁面。';
          return EMPTY;
        }),
        finalize(() => {
          this.isInitialLoading.set(false);
        }),
      )
      .subscribe(([data]) => {
        if (data.length === 0) {
          this.isInitialError.set(true);
          this.errorMsg = '載入失敗';
          return;
        }

        // --- Initialization & Setup ---
        const mobileCheck = this._uiStateService.isSmallScreen();
        this.isMobile.set(mobileCheck);
      });
  }

  onMapImageLoad(event: Event) {
    const img = event.target as HTMLImageElement;
    const { naturalWidth, naturalHeight } = img;
    if (naturalWidth > 0) {
      this.imageHeightToWidthRatio.set(naturalHeight / naturalWidth);
    }

    this._mapImgLoaded.next(true);
    this._mapImgLoaded.complete();

    const containerW = this.mapContainer.nativeElement.clientWidth;
    const containerH = this.mapContainer.nativeElement.clientHeight;

    // 1. 取得圖片原圖解析度 (naturalWidth, naturalHeight)
    // 2. 計算能完整顯示在容器內的最佳 fitScale (Math.min 確保寬高都不會溢出)
    const scaleX = containerW / naturalWidth;
    const scaleY = containerH / naturalHeight;
    const initialFitScale = Math.min(scaleX, scaleY, 1); // 不放大超過原圖

    // 3. 設定 mapContent 的真實渲染顯示寬高 (以此尺寸為基準，scale=1)
    const fittedW = naturalWidth * initialFitScale;
    const fittedH = naturalHeight * initialFitScale;

    this.imgWidth.set(fittedW);
    this.imgHeight.set(fittedH);
  }

  onMapImageError() {
    this._mapImgLoaded.error(new Error('Map image failed to load.'));
    this._mapImgLoaded.complete();
  }

  @HostListener('mousemove', ['$event'])
  mousemoveHandler(e: MouseEvent) {
    if (!this.isMobile()) {
      return;
    }
    if (this._selectStallService.selected) return;
  }

  focusCenterCenter() {
    this.focusTo(50, 50, 0, 0, 1);
  }

  focus(stall: StallData) {
    const { left, top, width, height } = stall.coords;
    this.focusTo(left, top, width, height, this.focusScale());
  }

  // 將指定攤位置中於畫面
  focusTo(left: number, top: number, width: number, height: number, scale?: number) {
    if (!this.mapContainer) return;

    const viewEl = this.mapContainer.nativeElement;
    const viewW = viewEl.offsetWidth;
    let viewH = viewEl.offsetHeight;

    // Mobile 下方如果有展開的攤位卡片，扣除該高度以取得真正的可視區域高度
    const mobileCardH = this._uiStateService.isMobile() ? 0 : 0;
    viewH = viewH - mobileCardH;

    if (viewW === 0 || viewH === 0) return;

    // 1. 決定目標 Scale (若當前縮放小於 focusScale，則放大至 focusScale)
    let targetScale;
    if (scale) {
      targetScale = scale;
      this.scale.set(scale);
    } else {
      targetScale = Math.max(this.scale(), this.focusScale());
      if (targetScale !== this.scale()) {
        this.scale.set(targetScale);
      }
    }

    // 2. 取得地圖原始基準寬高 (未縮放前的 100% 尺寸)
    const baseMapW = this.mapWidth();
    const baseMapH = this.mapHeight();

    // 3. 計算攤位中心點在 100% 原始地圖上的 px 座標 (Original X, Y)
    const stallLeft = (left / 100) * baseMapW;
    const stallTop = (top / 100) * baseMapH;
    const stallW = (width / 100) * baseMapW;
    const stallH = (height / 100) * baseMapH;

    const stallCenterX = stallLeft + stallW / 2;
    const stallCenterY = stallTop + stallH / 2;

    // 4. 計算可視範圍（Viewport）的有效中心點
    let viewCenterX = viewW / 2;
    let viewCenterY = viewH / 2;

    // Desktop 左側如果開啟側邊欄 (310px)，將視覺中心向右偏移
    if (!this._uiStateService.isMobile()) {
      const sidebarWidth = 310;
      viewCenterX = sidebarWidth + (viewW - sidebarWidth) / 2;
    }

    // 5. 核心算式：在 transform-origin: 0 0 下，要讓點 (stallCenterX * targetScale) 移動到 viewCenter
    // 公式：targetPan = viewCenter - (originalPoint * targetScale)
    const targetPanX = viewCenterX - stallCenterX * targetScale;
    const targetPanY = viewCenterY - stallCenterY * targetScale;

    // 6. 開啟 transition 動畫並套用邊界限制 (Clamp)
    this.autoFocusing.set(true);
    this._setPosition({ x: targetPanX, y: targetPanY });

    // 7. 動畫結束後關閉 autoFocusing (配合 CSS 300ms transition)
    setTimeout(() => {
      this.autoFocusing.set(false);
    }, 300);
  }

  private ticking = false;
  _setPosition(newTranslateXY: TargetXY, newScale = this.scale()) {
    const { x, y } = this.clampPosition(newTranslateXY.x, newTranslateXY.y);
    this.pan.set({ x, y });

    // 如果這幀還沒繪製，才預約下一幀繪製
    if (!this.ticking) {
      requestAnimationFrame(() => {
        this.renderMap(x, y, newScale);
        this.ticking = false;
      });
      this.ticking = true;
    }
  }

  private initialDistance = 0;
  private initialScale = 1;

  onTouchStart(event: TouchEvent) {
    if (event.touches.length === 2) {
      // 💡 當進入雙指模式時，中斷單指拖動，避免畫面抖動
      this.isDragging = false;
      this.autoFocusing.set(false);

      this.initialDistance = this.getDistance(event.touches);
      this.initialScale = this.scale();
    }
  }

  onTouchMove(event: TouchEvent) {
    if (event.touches.length === 2) {
      event.preventDefault(); // 阻止瀏覽器預設 Pinch 頁面放大行為

      const currentDistance = this.getDistance(event.touches);
      if (this.initialDistance <= 0 || currentDistance <= 0) return;

      // 1. 計算目標 Scale
      const scaleChange = currentDistance / this.initialDistance;
      const targetScale = this.initialScale * scaleChange;

      // 2. 💡 算雙指中心點 (Viewport 座標)
      const center = this.getTouchCenter(event.touches);

      // 3. 💡 套用 rAF + _zoomAtPoint 以雙指中心為基準進行縮放與位移
      if (this.rafId !== null) cancelAnimationFrame(this.rafId);
      this.rafId = requestAnimationFrame(() => {
        this._zoomAtPoint(targetScale, center);
        this.rafId = null;
      });
    }
  }

  onTouchEnd(event: TouchEvent) {
    if (event.touches.length < 2) {
      this.initialDistance = 0;
    }
  }

  // -----------------------------------------------------------
  // 🧮 幾何計算輔助 Function
  // -----------------------------------------------------------
  private getDistance(touches: TouchList): number {
    const [touch1, touch2] = [touches[0], touches[1]];
    const dx = touch2.clientX - touch1.clientX;
    const dy = touch2.clientY - touch1.clientY;
    return Math.hypot(dx, dy); // 等同 Math.sqrt(dx * dx + dy * dy)
  }

  // 💡 新增：取得雙指中心點
  private getTouchCenter(touches: TouchList): { x: number; y: number } {
    const [touch1, touch2] = [touches[0], touches[1]];
    return {
      x: (touch1.clientX + touch2.clientX) / 2,
      y: (touch1.clientY + touch2.clientY) / 2,
    };
  }

  // 「以指定座標為中心縮放」核心邏輯
  private _zoomAtPoint(targetScale: number, point: { x: number; y: number }) {
    const currentScale = this.scale();
    const minScale = 1; // 最小縮放限制
    const maxScale = this.maxScale();

    // 限制 Scale 範圍在 [minScale, maxScale] 之間
    const newScale = Math.min(Math.max(targetScale, minScale), maxScale);

    // 如果已經達到極限，不進行無謂的計算
    if (newScale === currentScale) return;

    // 取得點相對於 #mapContainer 左上角的座標 (px, py)
    let px = point.x;
    let py = point.y;

    if (this.mapContainer) {
      const containerRect = this.mapContainer.nativeElement.getBoundingClientRect();
      px = point.x - containerRect.left;
      py = point.y - containerRect.top;
    }

    // 核心數學算式：NewPan = Pointer - (Pointer - OldPan) * (NewScale / OldScale)
    const currentPan = this.pan();
    const scaleRatio = newScale / currentScale;

    const rawNewX = px - (px - currentPan.x) * scaleRatio;
    const rawNewY = py - (py - currentPan.y) * scaleRatio;

    // 更新狀態
    this.scale.set(newScale);
    this._setPosition({ x: rawNewX, y: rawNewY });
  }

  onWheel(event: WheelEvent) {
    event.preventDefault();
    this.autoFocusing.set(false);

    const currentScale = this.scale();
    const zoomFactor =
      event.deltaY < 0
        ? this._uiStateService.isMobile()
          ? 1.25
          : 1.2
        : this._uiStateService.isMobile()
          ? 0.5
          : 0.75;

    const targetScale = currentScale * zoomFactor;

    // 直接呼叫共用邏輯，傳入滑鼠座標
    this._zoomAtPoint(targetScale, { x: event.clientX, y: event.clientY });
  }

  onPointerDown(event: PointerEvent) {
    this.autoFocusing.set(false); // 關閉 Transition

    // 鎖定指標，即使滑鼠滑出瀏覽器邊界依然能持續捕捉拖曳
    (event.target as HTMLElement).setPointerCapture(event.pointerId);

    this.isDragging = true;
    this.startPointer = { x: event.clientX, y: event.clientY };
    this.startPan = { ...this.pan() };
    this.onDragging.emit(true);
  }

  onPointerMove(event: PointerEvent) {
    if (!this.isDragging) return;

    const dx = event.clientX - this.startPointer.x;
    const dy = event.clientY - this.startPointer.y;

    const rawX = this.startPan.x + dx;
    const rawY = this.startPan.y + dy;

    // 使用 requestAnimationFrame 來對齊螢幕刷新率（60fps / 120fps）
    if (this.rafId !== null) cancelAnimationFrame(this.rafId);

    this.rafId = requestAnimationFrame(() => {
      this._setPosition({ x: rawX, y: rawY });

      this.rafId = null;
    });
  }

  onPointerUp(event: PointerEvent) {
    if (!this.isDragging) return;
    this.isDragging = false;
    this.onDragging.emit(false);
    if (this.rafId !== null) cancelAnimationFrame(this.rafId);

    try {
      (event.target as HTMLElement).releasePointerCapture(event.pointerId);
    } catch {}
  }

  private clampPosition(x: number, y: number): { x: number; y: number } {
    if (!this.mapContainer || !this.mapContent) return { x, y };

    const container = this.mapContainer.nativeElement;
    const content = this.mapContent.nativeElement;

    const containerW = container.clientWidth;
    const containerH = container.clientHeight;

    const s = this.scale();
    const origMapW = content.offsetWidth;
    const origMapH = content.offsetHeight;
    const mapW = origMapW * s;
    const mapH = origMapH * s;

    // 取得 UI 邊界偏移量
    const sidebarW =
      !this._uiStateService.isMobile() && !!this._leftSidebarService.curr && !this.isAtRoutingPage()
        ? 310
        : 0;

    const boundingX = 40;
    const boundingY = this._uiStateService.isMobile() ? this.mobileStallInfoDefaultH : 40;
    // --- X 軸邊界 ---
    // minX: 地圖拉到最左側時（右邊緣切齊容器右邊）
    const minX = containerW - mapW - boundingX;
    // maxX: 地圖拉到最右側時（允許向右推到 sidebarW 的位置）
    const maxX = sidebarW + boundingX;

    // --- Y 軸邊界 ---
    // minY: 地圖拉到最上方時（留出底部資訊欄）
    const minY = containerH - mapH - boundingY;
    // maxY: 地圖拉到最下方時（上邊緣切齊容器頂部）
    const maxY = boundingY;

    // 防護：如果地圖縮放後比容器還小，強制自動置中，不讓地圖隨意飄走
    let finalX = x;
    let finalY = y;

    if (containerW <= origMapW) {
      finalX = Math.min(Math.max(x, minX), maxX);
      if (this.isMobile()) {
        finalY = Math.min(Math.max(y, minY), maxY);
      } else {
        if (mapH < containerH) {
          const max = containerH - mapH;
          const min = 0;
          finalY = Math.min(Math.max(y, min), max);
        } else {
          finalY = Math.min(Math.max(y, minY), maxY);
        }
      }
    }

    if (containerH <= origMapH) {
      finalY = Math.min(Math.max(y, minY), maxY);
      if (mapW < containerW) {
        const max = containerW - mapW;
        const min = 0;
        finalX = Math.min(Math.max(x, min), max);
      } else {
        finalX = Math.min(Math.max(x, minX), maxX);
      }
    }

    return { x: finalX, y: finalY };
  }

  /**
   * 統一的地圖與 Sticky 標籤渲染函式
   * 確保兩者在同一幀（Frame）內同步更新，解決拖曳延遲問題
   */
  private renderMap(tx: number, ty: number, scale: number) {
    const contentEl = this.mapContent?.nativeElement;
    if (!contentEl) return;

    const isAnimating = this.autoFocusing();
    const transitionStyle = isAnimating ? 'transform 300ms cubic-bezier(0, 0, 0.2, 1)' : 'none';

    // 1. 直接更新 #mapContent 的 DOM 樣式 (不經過 Angular Binding)
    contentEl.style.transition = transitionStyle;
    contentEl.style.transform = `translate3d(${tx}px, ${ty}px, 0) scale(${scale})`;

    // 2. 同步更新 Sticky 標籤層
    this.updateStickyZones(tx, ty, scale, isAnimating);
  }
}
