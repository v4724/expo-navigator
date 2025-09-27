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
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { MatIcon } from '@angular/material/icon';
import { BehaviorSubject, catchError, EMPTY, finalize, first, forkJoin, map, Subject } from 'rxjs';
import { StallGroupArea } from 'src/app/components/stall-group-area/stall-group-area';
import { Stall } from 'src/app/components/stall/stall';
import { stallGridRefs } from 'src/app/core/const/official-data';
import { Area } from 'src/app/core/interfaces/area.interface';
import { AreaService } from 'src/app/core/services/state/area-service';
import { SelectStallService } from 'src/app/core/services/state/select-stall-service';
import { StallMapService } from 'src/app/core/services/state/stall-map-service';
import { StallService } from 'src/app/core/services/state/stall-service';
import { UiStateService } from 'src/app/core/services/state/ui-state-service';

@Component({
  selector: 'app-map',
  imports: [CommonModule, Stall, StallGroupArea, MatIcon],
  templateUrl: './map.html',
  styleUrl: './map.scss',
})
export class Map implements OnInit, AfterViewInit {
  @ViewChild('mapImage') mapImage!: ElementRef<HTMLImageElement>;
  @ViewChild('mapContainer') mapContainer!: ElementRef<HTMLImageElement>;

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

  mapImgSrc = `https://cdn.jsdelivr.net/gh/v4724/nice-0816@c6b3cd1/assets/stalls-map.jpg`;
  _mapImgLoaded = new BehaviorSubject<boolean>(false);
  mapImgLoaded$ = this._mapImgLoaded.asObservable();
  mapImgLoaded = toSignal(this._mapImgLoaded);

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

  ngOnInit() {
    this._mapImgLoaded.pipe().subscribe(() => {
      this._stallMapService.mapImage = this.mapImage.nativeElement;
      this._stallMapService.mapContainer = this.mapContainer.nativeElement;

      this.mapWidth.set(this.mapImage.nativeElement.offsetWidth);
      this.mapHeight.set(this.mapImage.nativeElement.offsetHeight);
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
