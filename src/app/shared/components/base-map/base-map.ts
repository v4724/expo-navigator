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
  signal,
  ViewChild,
  viewChildren,
  WritableSignal,
} from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
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

@Component({
  selector: 'app-base-map',
  imports: [CommonModule, MatIcon, TooltipModule],
  templateUrl: './base-map.html',
  styleUrl: './base-map.scss',
})
export class BaseMap implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('mapImage') mapImage!: ElementRef<HTMLImageElement>;
  @ViewChild('mapContainer') mapContainer!: ElementRef<HTMLDivElement>;
  @ViewChild('mapContent') mapContent!: ElementRef<HTMLDivElement>;
  zoneElements = viewChildren<ElementRef<HTMLDivElement>>('zoneLabel');

  private _stallMapService = inject(StallMapService);
  private _uiStateService = inject(UiStateService);
  private _stallService = inject(StallService);
  private _selectStallService = inject(SelectStallService);
  private _leftSidebarService = inject(LeftSidebarService);
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

  atRoutingPage = false;
  constructor() {
    this.atRoutingPage = this._router.url.includes('routing');

    effect(() => {
      if (this.zoneElements().length > 0) {
        this._zoneElLoaded.next(true);
      }
    });
  }

  ngOnInit() {
    if (this._uiStateService.isPlatformBrowser()) {
      const vH = window.visualViewport?.height;
      const mobileStallInfoDefaultH = vH ? vH * 0.25 : 300;
      this.mobileStallInfoDefaultH = this._uiStateService.isMobile() ? mobileStallInfoDefaultH : 0;
    }

    this._mapImgLoaded.pipe(first((val) => !!val)).subscribe(() => {
      this._stallMapService.mapImage = this.mapImage.nativeElement;
      this._stallMapService.mapContainer = this.mapContainer.nativeElement;

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
  }

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
    const baseSize = 22;
    const baseFontSize = 12;
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
      el.style.transform = `translate3d(${finalX}px, ${finalY}px, 0)`;
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

  // 將指定攤位置中於畫面
  focus(stall: StallData) {
    if (!stall || !this.mapContainer) return;

    const viewEl = this.mapContainer.nativeElement;
    const viewW = viewEl.offsetWidth;

    // Mobile 下方如果有展開的攤位卡片，扣除該高度以取得真正的可視區域高度
    const mobileCardH = this._uiStateService.isMobile() ? this.mobileStallInfoDefaultH : 0;
    const viewH = viewEl.offsetHeight - mobileCardH;

    if (viewW === 0 || viewH === 0) return;

    // 1. 決定目標 Scale (若當前縮放小於 focusScale，則放大至 focusScale)
    const targetScale = Math.max(this.scale(), this.focusScale());
    if (targetScale !== this.scale()) {
      this.scale.set(targetScale);
    }

    // 2. 取得地圖原始基準寬高 (未縮放前的 100% 尺寸)
    const baseMapW = this.mapWidth();
    const baseMapH = this.mapHeight();

    // 3. 計算攤位中心點在 100% 原始地圖上的 px 座標 (Original X, Y)
    const stallLeft = (stall.coords.left / 100) * baseMapW;
    const stallTop = (stall.coords.top / 100) * baseMapH;
    const stallW = (stall.coords.width / 100) * baseMapW;
    const stallH = (stall.coords.height / 100) * baseMapH;

    const stallCenterX = stallLeft + stallW / 2;
    const stallCenterY = stallTop + stallH / 2;

    // 4. 計算可視範圍（Viewport）的有效中心點
    let viewCenterX = viewW / 2;
    let viewCenterY = viewH / 2;

    // Desktop 左側如果開啟側邊欄 (310px)，將視覺中心向右偏移
    if (!this._uiStateService.isMobile() && this._leftSidebarService.curr) {
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
      event.preventDefault(); // 阻止滾動
      this.initialDistance = this.getDistance(event.touches);
      this.initialScale = this.scale();
    }
  }

  onTouchMove(event: TouchEvent) {
    if (event.touches.length === 2) {
      event.preventDefault();
      const currentDistance = this.getDistance(event.touches);
      const scaleChange = currentDistance / this.initialDistance;
      let newScale = Math.min(Math.max(this.initialScale * scaleChange, 1), this.maxScale());
      this.scale.set(newScale);
    }
  }

  onTouchEnd(event: TouchEvent) {
    if (event.touches.length < 2) {
      this.initialDistance = 0;
    }
  }

  private getDistance(touches: TouchList): number {
    const [touch1, touch2] = [touches[0], touches[1]];
    const dx = touch2.clientX - touch1.clientX;
    const dy = touch2.clientY - touch1.clientY;
    return Math.sqrt(dx * dx + dy * dy);
  }

  onWheel(event: WheelEvent) {
    // 阻止瀏覽器預設的全頁面滾動
    event.preventDefault();
    this.autoFocusing.set(false); // 關閉 Transition

    if (!this.mapContainer) return;

    const currentScale = this.scale();
    const zoomFactor =
      (event as WheelEvent).deltaY < 0
        ? this._uiStateService.isMobile()
          ? 1.25
          : 1.2
        : this._uiStateService.isMobile()
          ? 0.5
          : 0.75;

    const newScale = Math.min(Math.max(currentScale * zoomFactor, 1), this.maxScale());

    // 如果已經達到縮放極限，不做任何計算
    if (newScale === currentScale) return;

    // 2. 取得滑鼠相對於 #mapContainer 可視範圍左上角的座標 (px, py)
    const containerRect = this.mapContainer.nativeElement.getBoundingClientRect();
    const px = event.clientX - containerRect.left;
    const py = event.clientY - containerRect.top;

    // 3. 核心數學：以滑鼠點為中心計算新的 (x, y) translate 位移
    // 算式原理：NewPan = Pointer - (Pointer - OldPan) * (NewScale / OldScale)
    const currentPan = this.pan();
    const scaleRatio = newScale / currentScale;

    const rawNewX = px - (px - currentPan.x) * scaleRatio;
    const rawNewY = py - (py - currentPan.y) * scaleRatio;

    // 4. 更新 Scale 並將新座標送入 clamp 鎖定邊界
    this.scale.set(newScale);
    this._setPosition({ x: rawNewX, y: rawNewY });
  }

  onPointerDown(event: PointerEvent) {
    this.autoFocusing.set(false); // 關閉 Transition

    // 鎖定指標，即使滑鼠滑出瀏覽器邊界依然能持續捕捉拖曳
    (event.target as HTMLElement).setPointerCapture(event.pointerId);

    this.isDragging = true;
    this.startPointer = { x: event.clientX, y: event.clientY };
    this.startPan = { ...this.pan() };
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
    const mapW = content.offsetWidth * s;
    const mapH = content.offsetHeight * s;

    // 取得 UI 邊界偏移量
    const sidebarW =
      !this._uiStateService.isMobile() && !!this._leftSidebarService.curr && !this.atRoutingPage
        ? 310
        : 0;
    const mobileStallInfoH =
      this._uiStateService.isMobile() && this._selectStallService.selected
        ? this.mobileStallInfoDefaultH
        : 0;

    // --- X 軸邊界 ---
    // minX: 地圖拉到最左側時（右邊緣切齊容器右邊）
    const minX = containerW - mapW;
    // maxX: 地圖拉到最右側時（允許向右推到 sidebarW 的位置）
    const maxX = sidebarW;

    // --- Y 軸邊界 ---
    // minY: 地圖拉到最上方時（留出底部手機資訊欄）
    const minY = containerH - mapH - mobileStallInfoH;
    // maxY: 地圖拉到最下方時（上邊緣切齊容器頂部）
    const maxY = 0;

    // 防護：如果地圖縮放後比容器還小，強制自動置中，不讓地圖隨意飄走
    let finalX = x;
    let finalY = y;

    if (mapW < containerW) {
      finalX = (containerW - mapW) / 2 + sidebarW / 2;
    } else {
      finalX = Math.min(Math.max(x, minX), maxX);
    }

    if (mapH < containerH) {
      finalY = (containerH - mapH) / 2 - mobileStallInfoH / 2;
    } else {
      finalY = Math.min(Math.max(y, minY), maxY);
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
