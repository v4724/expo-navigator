import { CdkDragEnd, CdkDragMove, CdkDragStart, DragDropModule } from '@angular/cdk/drag-drop';
import { CommonModule } from '@angular/common';
import {
  AfterViewInit,
  Component,
  computed,
  ElementRef,
  HostListener,
  inject,
  OnInit,
  signal,
  ViewChild,
  WritableSignal,
} from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { MatIcon } from '@angular/material/icon';
import { BehaviorSubject, catchError, EMPTY, finalize, first, forkJoin, map } from 'rxjs';
import { StallGroupArea } from 'src/app/components/stall-group-area/stall-group-area';
import { Stall } from 'src/app/components/stall/stall';
import { MAP_URL } from 'src/app/core/const/resource';
import { TargetXY } from 'src/app/core/directives/draggable';
import { Area } from 'src/app/core/interfaces/area.interface';
import { StallData } from 'src/app/core/interfaces/stall.interface';
import { AreaService } from 'src/app/core/services/state/area-service';
import { SelectStallService } from 'src/app/core/services/state/select-stall-service';
import { StallMapService } from 'src/app/core/services/state/stall-map-service';
import { StallService } from 'src/app/core/services/state/stall-service';
import { UiStateService } from 'src/app/core/services/state/ui-state-service';

@Component({
  selector: 'app-map',
  imports: [CommonModule, Stall, StallGroupArea, MatIcon, DragDropModule],
  templateUrl: './map.html',
  styleUrl: './map.scss',
})
export class Map implements OnInit, AfterViewInit {
  @ViewChild('mapImage') mapImage!: ElementRef<HTMLImageElement>;
  @ViewChild('mapContainer') mapContainer!: ElementRef<HTMLDivElement>;
  @ViewChild('mapContent') mapContent!: ElementRef<HTMLDivElement>;

  private _stallMapService = inject(StallMapService);
  private _areaService = inject(AreaService);
  private _uiStateService = inject(UiStateService);
  private _stallService = inject(StallService);
  private _selectStallService = inject(SelectStallService);

  isMobile: WritableSignal<boolean> = signal<boolean>(false);
  isInitialLoading: WritableSignal<boolean> = signal<boolean>(true);
  isInitialError: WritableSignal<boolean> = signal<boolean>(false);
  errorMsg = '';

  mapWidth = signal<number>(0);
  mapHeight = signal<number>(0);

  // 縮放、拖曳的計算值
  scale = signal(1);
  maxScale = signal(3);
  focusScale = signal(3);
  freePosition = { x: 0, y: 0 }; // cdkDragFreeDragPosition 來源
  private dragStartPointer = { x: 0, y: 0 };
  private dragStartPos = { x: 0, y: 0 };
  private firstMove = true;

  mapImgSrc = MAP_URL;
  _mapImgLoaded = new BehaviorSubject<boolean>(false);
  mapImgLoaded$ = this._mapImgLoaded.asObservable();
  mapImgLoaded = toSignal(this._mapImgLoaded);

  // 攤位
  allStalls$ = this._stallService.allStalls$;
  stallZoneDef = toSignal(
    this._stallService.stallZoneDef$.pipe(
      map((def) => {
        return Array.from(def.values() ?? []);
      }),
    ),
  );

  // 圖片比例
  private imageHeightToWidthRatio = signal<number>(0);
  imageAspectRatio = computed(() => {
    const ratio = this.imageHeightToWidthRatio();
    // Provide the calculated width/height ratio, or a default 1/1 square until the image loads.
    return ratio > 0 ? 1 / ratio : 1;
  });

  // 場內 only 圖層
  showAreas = toSignal(this._areaService.show$);
  selectedAreasId = toSignal(this._areaService.selectedAreasId$, {
    initialValue: new Set<string>(),
  });
  selectedAreas = computed(() => {
    const mapW = this.mapWidth();
    const mapH = this.mapHeight();
    if (!mapW || !mapH) {
      return [];
    }
    const data: Area[] = [];
    this.selectedAreasId().forEach((id: string) => {
      const area = this._areaService.toArea(mapW, mapH, id);
      area && data.push(area);
    });
    return data;
  });

  // 自動定位置中
  autoFocusing = signal<boolean>(false);

  // mobile 攤位資訊高度
  mobileStallInfoDefaultH = 0;

  constructor() {}

  ngOnInit() {
    this.mobileStallInfoDefaultH = this._uiStateService.isMobile() ? 429 : 0;

    this.maxScale.set(this._uiStateService.isMobile() ? 6 : 3);
    this.focusScale.set(this._uiStateService.isMobile() ? 5 : 2);

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
      });
    });

    this._stallMapService.focus$.subscribe((stallId) => {
      const stallData = this._stallService.findStall(stallId);

      this.autoFocusing.set(true);
      requestAnimationFrame(() => {
        stallData && this.focus(stallData);
        setTimeout(() => {
          this.autoFocusing.set(false);
        }, 300);
      });
    });
  }

  ngAfterViewInit() {
    this.runApp();
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

  onWheel(event: WheelEvent) {
    event.preventDefault();
    const zoomIntensity = this._uiStateService.isMobile() ? 0.5 : 0.1;
    const oldScale = this.scale();
    let newScale = oldScale + (event.deltaY < 0 ? zoomIntensity : -zoomIntensity);
    newScale = Math.min(Math.max(newScale, 1), this.maxScale());

    const rect = (event.currentTarget as HTMLElement).getBoundingClientRect();

    // 滑鼠相對於容器的座標 (視窗內位置 - 容器左上角)
    const offsetX = event.clientX - rect.left;
    const offsetY = event.clientY - rect.top;

    // 可視範圍中心點
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    // 滑鼠相對於可視範圍中心的位移（像素）
    const mouseOffsetXFromCenter = offsetX - centerX;
    const mouseOffsetYFromCenter = offsetY - centerY;

    // 比例差（縮放前後）
    const scaleDelta = newScale / oldScale;

    // 平移補償，讓滑鼠對應到的內容點不會移動
    const newTranslateX = this.freePosition.x - mouseOffsetXFromCenter * (scaleDelta - 1);
    const newTranslateY = this.freePosition.y - mouseOffsetYFromCenter * (scaleDelta - 1);

    this.scale.set(newScale);
    this._setPosition({ x: newTranslateX, y: newTranslateY });
  }

  // 將指定攤位置中於畫面
  focus(stall: StallData) {
    if (!stall || !this.mapImage || !this.mapContent) return;

    if (this.scale() < this.focusScale()) {
      const targetScale = Math.max(this.scale(), this.focusScale());
      this.scale.set(targetScale);
    }

    const mapEl = this.mapImage.nativeElement;
    const viewEl = this.mapContainer.nativeElement;

    const mapW = mapEl.offsetWidth;
    const mapH = mapEl.offsetHeight;
    const scaleMapW = mapW * this.scale();
    const scaleMapH = mapH * this.scale();
    const viewW = viewEl.offsetWidth;
    const viewH = this._uiStateService.isMobile()
      ? viewEl.offsetHeight - this.mobileStallInfoDefaultH
      : viewEl.offsetHeight;

    console.debug('mapWH', mapW, mapH);
    console.debug('scaleMapWH', scaleMapW, scaleMapH);
    console.debug('viewWH', viewW, viewH);
    if (scaleMapW === 0 || scaleMapH === 0 || viewW === 0 || viewH === 0) return;

    // 將百分比座標轉換為地圖實際座標
    const stallLeft = (stall.coords.left / 100) * scaleMapW;
    const stallTop = (stall.coords.top / 100) * scaleMapH;
    const stallWidth = (stall.coords.width / 100) * scaleMapW;
    const stallHeight = (stall.coords.height / 100) * scaleMapH;

    const stallCenterX = stallLeft + stallWidth / 2;
    const stallCenterY = stallTop + stallHeight / 2;

    console.debug('orig stall position on screen', stallCenterX, stallCenterY);

    // 目前平移 XY
    const translateX = this.freePosition.x;
    const translateY = this.freePosition.y;

    // 畫面中心（容器內的視圖中心點）
    const viewCenterX = viewW / 2;
    const viewCenterY = viewH / 2;

    // 地圖縮放後中心
    const scaledMapCenterX = scaleMapW / 2;
    const scaledMapCenterY = scaleMapH / 2;

    // 攤位在縮放後地圖的座標
    const scaledStallX = stallCenterX;
    const scaledStallY = stallCenterY;

    // 攤位目前在畫面上的位置
    const screenX = stallCenterX;
    const screenY = stallCenterY;
    console.debug('scale stall position on screen', screenX, screenY);

    // 檢查是否已在畫面中
    const isInside =
      screenX > scaledMapCenterX - viewCenterX - translateX &&
      screenY > scaledMapCenterY - viewCenterY - translateY &&
      screenX < scaledMapCenterX + viewCenterX - translateX &&
      screenY < scaledMapCenterY + viewCenterY - translateY;

    console.debug('isInside', isInside);
    console.debug(
      'isInside',
      screenX,
      '>',
      scaledMapCenterX,
      '-',
      viewCenterX,
      '-',
      translateX,
      screenX > scaledMapCenterX - viewCenterX - translateX,
    );
    console.debug(
      'isInside',
      screenY,
      '>',
      scaledMapCenterY,
      '-',
      viewCenterY,
      '-',
      translateY,
      screenY > scaledMapCenterY - viewCenterY - translateY,
    );
    console.debug(
      'isInside',
      screenX,
      '<',
      scaledMapCenterX,
      '+',
      viewCenterX,
      '+',
      translateX,
      screenX < scaledMapCenterX + viewCenterX + translateX,
    );
    console.debug(
      'isInside',
      screenY,
      '<',
      scaledMapCenterY,
      '+',
      viewCenterY,
      '+',
      translateY,
      screenY < scaledMapCenterY + viewCenterY + translateY,
    );

    if (isInside) return;

    // mobile 下方有攤位資訊，中心要再往上移
    const centerY = this._uiStateService.isMobile()
      ? (viewH - this.mobileStallInfoDefaultH) / 3
      : 0;
    // 將攤位置中（相對於地圖中心 0,0）
    const newTranslateX = (scaledMapCenterX - scaledStallX) / this.scale();
    const newTranslateY = (scaledMapCenterY - scaledStallY) / this.scale() - Math.abs(centerY);

    console.debug('orig focus position');
    console.debug(newTranslateX, scaledMapCenterX, '-', scaledStallX, '/', this.scale());
    console.debug(
      newTranslateY,
      scaledMapCenterY,
      '-',
      scaledStallY,
      '/',
      this.scale(),
      '-',
      Math.abs(centerY),
    );

    // 應用 clamp 限制（避免地圖超出畫面邊界）
    this._setPosition({ x: newTranslateX, y: newTranslateY });
  }

  _setPosition(newTranslateXY: TargetXY) {
    const { x, y } = this.clampPosition(newTranslateXY.x, newTranslateXY.y);

    console.debug('set map position', x, y);
    this.freePosition = {
      x,
      y,
    };
  }

  onDragStarted(event: CdkDragStart) {
    this.firstMove = true;
  }

  onDragMoved(event: CdkDragMove) {
    if (this.firstMove) {
      this.dragStartPointer = {
        x: event.pointerPosition.x,
        y: event.pointerPosition.y,
      };
      this.dragStartPos = { ...this.freePosition };
      this.firstMove = false;
    }

    const s = this.scale();
    const dx = (event.pointerPosition.x - this.dragStartPointer.x) / s;
    const dy = (event.pointerPosition.y - this.dragStartPointer.y) / s;

    const origX = this.dragStartPos.x + dx;
    const origY = this.dragStartPos.y + dy;

    this._setPosition({ x: origX, y: origY });
  }

  onDragEnded(event: CdkDragEnd) {
    // 可以在這裡做最後修正或發送位置
  }

  // 中心點 0,0 限制拖曳範圍
  private clampPosition(x: number, y: number): { x: number; y: number } {
    const content = this.mapContent.nativeElement;

    const mapWidth = content.offsetWidth;
    const mapHeight = content.offsetHeight;

    // 計算縮放後的地圖大小
    const s = this.scale();
    const displayWidth = mapWidth * s;
    const displayHeight = mapHeight * s;

    const cw = content.offsetWidth;
    const ch = content.offsetHeight;

    // 邊界，可拖曳的範圍值
    // 假設左側元件寬度
    const viewElH = this.mapContainer.nativeElement.offsetHeight;
    const sidebarW = this._uiStateService.isMobile() ? 0 : 310;
    const mobileStallInfoH = this._uiStateService.isMobile() ? viewElH / 4 : 0;
    let minX = (cw - displayWidth) / 2 / s;
    let maxX = ((displayWidth - cw) / 2 + sidebarW) / s;
    let minY = ((ch - displayHeight) / 2 - mobileStallInfoH) / s;
    let maxY = (displayHeight - ch) / 2 / s;

    // x > 0 (往右方拖曳，地圖往右平移)
    x = x > 0 ? Math.min(x, maxX) : Math.max(x, minX);
    y = y > 0 ? Math.min(y, maxY) : Math.max(y, minY);

    return { x, y };
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
}

// function renderDebugBorders(mapContainer: HTMLElement) {
//   stallGridRefs.forEach((row) => {
//     const borderEl = document.createElement('div');
//     borderEl.className = 'debug-border';
//     borderEl.style.top = `${row.boundingBox.top}%`;
//     borderEl.style.left = `${row.boundingBox.left}%`;
//     borderEl.style.width = `${row.boundingBox.right - row.boundingBox.left}%`;
//     borderEl.style.height = `${row.boundingBox.bottom - row.boundingBox.top}%`;

//     const label = document.createElement('span');
//     label.textContent = row.zoneId;
//     borderEl.appendChild(label);

//     mapContainer.appendChild(borderEl);
//   });
// }
