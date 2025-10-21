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
import { stallGridRefs } from 'src/app/core/const/official-data';
import { MAP_URL } from 'src/app/core/const/resource';
import { Draggable, TargetXY } from 'src/app/core/directives/draggable';
import { Area } from 'src/app/core/interfaces/area.interface';
import { StallData } from 'src/app/core/interfaces/stall.interface';
import { AreaService } from 'src/app/core/services/state/area-service';
import { SelectStallService } from 'src/app/core/services/state/select-stall-service';
import { StallMapService } from 'src/app/core/services/state/stall-map-service';
import { StallService } from 'src/app/core/services/state/stall-service';
import { UiStateService } from 'src/app/core/services/state/ui-state-service';

@Component({
  selector: 'app-map',
  imports: [CommonModule, Stall, StallGroupArea, MatIcon, Draggable],
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
  translateX = signal(0);
  translateY = signal(0);
  scale = signal(1);

  mapImgSrc = MAP_URL;
  _mapImgLoaded = new BehaviorSubject<boolean>(false);
  mapImgLoaded$ = this._mapImgLoaded.asObservable();
  mapImgLoaded = toSignal(this._mapImgLoaded);

  // 攤位
  allStalls$ = this._stallService.allStalls$;
  stallGridRefs = stallGridRefs;

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

  ngOnInit() {
    this._mapImgLoaded.pipe(first((val) => !!val)).subscribe(() => {
      this._stallMapService.mapImage = this.mapImage.nativeElement;
      this._stallMapService.mapContainer = this.mapContainer.nativeElement;

      requestAnimationFrame(() => {
        this.mapWidth.set(this.mapContent.nativeElement.offsetWidth);
        this.mapHeight.set(this.mapContent.nativeElement.offsetHeight);
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
    const zoomIntensity = 0.1;
    const oldScale = this.scale();
    let newScale = oldScale + (event.deltaY < 0 ? zoomIntensity : -zoomIntensity);
    newScale = Math.min(Math.max(newScale, 1), 3);

    const rect = (event.currentTarget as HTMLElement).getBoundingClientRect();

    // 滑鼠相對於容器的座標 (視窗內位置 - 容器左上角)
    const offsetX = event.clientX - rect.left;
    const offsetY = event.clientY - rect.top;

    // 視圖中心點
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    // 滑鼠相對於視圖中心的位移（像素）
    const mouseOffsetXFromCenter = offsetX - centerX;
    const mouseOffsetYFromCenter = offsetY - centerY;

    // 比例差（縮放前後）
    const scaleDelta = newScale / oldScale;

    // 平移補償，讓滑鼠對應到的內容點不會移動
    const newTranslateX = this.translateX() - mouseOffsetXFromCenter * (scaleDelta - 1);
    const newTranslateY = this.translateY() - mouseOffsetYFromCenter * (scaleDelta - 1);

    this.scale.set(newScale);
    this.setPosition({ x: newTranslateX, y: newTranslateY });
  }

  setPosition(targetBgXY: TargetXY) {
    const xy = this.clampedBgXY(targetBgXY);

    if (xy) {
      this.translateX.set(xy.clampedBgX);
      this.translateY.set(xy.clampedBgY);
    }
  }

  // 限制（Clamp）地圖偏移量
  clampedBgXY(targetBgXY: TargetXY): { clampedBgX: number; clampedBgY: number } | null {
    const x = targetBgXY.x;
    const y = targetBgXY.y;

    const viewW = this.mapContent.nativeElement.offsetWidth;
    const viewH = this.mapContent.nativeElement.offsetHeight;
    if (viewW === 0 || viewH === 0) return null;

    const mapImage = this.mapImage.nativeElement;
    const mapW = mapImage?.offsetWidth ?? 0;
    const mapH = mapImage?.offsetHeight ?? 0;
    if (mapW === 0 || mapH === 0) return null;

    // 計算縮放後的地圖大小
    const scaledMapW = mapW * this.scale();
    const scaledMapH = mapH * this.scale();

    // 邊界，可拖曳的範圍值
    // 假設左側元件寬度
    const sidebarW = 310;
    const minX = (viewW - scaledMapW) / 2;
    const minY = (viewH - scaledMapH) / 2;
    const maxX = (scaledMapW - viewW) / 2 + sidebarW;
    const maxY = (scaledMapH - viewH) / 2;

    // 限制（Clamp）地圖偏移量 x>0: 往左上拖曳、反之往右下
    const clampedBgX = x > 0 ? Math.min(x, maxX) : Math.max(x, minX);
    const clampedBgY = y > 0 ? Math.min(y, maxY) : Math.max(y, minY);

    return {
      clampedBgX,
      clampedBgY,
    };
  }

  focus(stall: StallData) {
    if (!stall || !this.mapImage || !this.mapContent) return;

    if (this.scale() < 2) {
      const targetScale = Math.max(this.scale(), 2);
      this.scale.set(targetScale);
    }

    const mapEl = this.mapImage.nativeElement;
    const viewEl = this.mapContent.nativeElement;

    const mapW = mapEl.naturalWidth || mapEl.offsetWidth;
    const mapH = mapEl.naturalHeight || mapEl.offsetHeight;
    const viewW = viewEl.offsetWidth;
    const viewH = viewEl.offsetHeight;
    if (mapW === 0 || mapH === 0 || viewW === 0 || viewH === 0) return;

    // 將百分比座標轉換為地圖實際座標
    const stallLeft = (parseFloat(stall.coords.left) / 100) * mapW;
    const stallTop = (parseFloat(stall.coords.top) / 100) * mapH;
    const stallWidth = (parseFloat(stall.coords.width) / 100) * mapW;
    const stallHeight = (parseFloat(stall.coords.height) / 100) * mapH;

    const stallCenterX = stallLeft + stallWidth / 2;
    const stallCenterY = stallTop + stallHeight / 2;

    const scale = this.scale();

    // 畫面中心（容器內的視圖中心點）
    const viewCenterX = viewW / 2;
    const viewCenterY = viewH / 2;

    // 地圖縮放後尺寸
    const scaledMapW = mapW * scale;
    const scaledMapH = mapH * scale;

    // 攤位在縮放後地圖的座標
    const scaledStallX = stallCenterX * scale;
    const scaledStallY = stallCenterY * scale;

    // 當前平移
    const currentX = this.translateX();
    const currentY = this.translateY();

    // 攤位目前在畫面上的位置
    const screenX = scaledStallX + currentX;
    const screenY = scaledStallY + currentY;

    // 檢查是否已在畫面中
    const margin = 50;
    const isInside =
      screenX > margin && screenY > margin && screenX < viewW - margin && screenY < viewH - margin;

    if (isInside) return;

    // 將攤位置中（相對於地圖中心）
    const newTranslateX = viewCenterX - scaledStallX;
    const newTranslateY = viewCenterY - scaledStallY;

    // 應用 clamp 限制（避免地圖超出畫面邊界）
    this.setPosition({ x: newTranslateX, y: newTranslateY });
  }
}

function renderDebugBorders(mapContainer: HTMLElement) {
  stallGridRefs.forEach((row) => {
    const borderEl = document.createElement('div');
    borderEl.className = 'debug-border';
    borderEl.style.top = `${row.boundingBox.top}%`;
    borderEl.style.left = `${row.boundingBox.left}%`;
    borderEl.style.width = `${row.boundingBox.right - row.boundingBox.left}%`;
    borderEl.style.height = `${row.boundingBox.bottom - row.boundingBox.top}%`;

    const label = document.createElement('span');
    label.textContent = row.groupId;
    borderEl.appendChild(label);

    mapContainer.appendChild(borderEl);
  });
}
