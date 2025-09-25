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
import { processStalls } from '../../ts/stall-processor';
import { stallGridRefs } from '../../core/const/official-data';
import { Lightbox } from 'src/app/shared/components/lightbox/lightbox';
import { StallModal } from 'src/app/components/stall-modal/stall-modal';
import { Tooptip } from 'src/app/shared/components/tooptip/tooptip';
import { UiStateService } from 'src/app/core/services/state/ui-state-service';
import { StallMapService } from 'src/app/core/services/state/stall-map-service';
import { Magnifier } from 'src/app/components/magnifier/magnifier';
import { StallService } from 'src/app/core/services/state/stall-service';
import { CommonModule } from '@angular/common';
import { TooltipService } from 'src/app/core/services/state/tooltip-service';
import { Stall } from 'src/app/components/stall/stall';
import { StallGroupArea } from 'src/app/components/stall-group-area/stall-group-area';
import { catchError, EMPTY, finalize, forkJoin, from, Subject, tap } from 'rxjs';

import { LayersController } from 'src/app/components/layers-controller/layers-controller';
import { fetchExcelData } from 'src/app/utils/google-excel-data-loader';
import { STALL_CSV_URL } from 'src/app/core/const/google-excel-csv-url';
import { AreaService } from 'src/app/core/services/state/area-service';
import { toSignal } from '@angular/core/rxjs-interop';
import { Area } from 'src/app/core/interfaces/area.interface';
import { InputSearch } from 'src/app/components/input-search/input-search';

@Component({
  selector: 'app-stalls-map',
  imports: [
    Lightbox,
    StallModal,
    Tooptip,
    Magnifier,
    CommonModule,
    Stall,
    StallGroupArea,
    LayersController,
    InputSearch,
  ],
  templateUrl: './stalls-map.html',
  styleUrl: './stalls-map.scss',
})
export class StallsMap implements OnInit, AfterViewInit {
  @ViewChild(Magnifier) magnifier!: Magnifier;
  @ViewChild(StallModal) stallModal!: StallModal;
  @ViewChild('mapImage') mapImage!: ElementRef<HTMLImageElement>;
  @ViewChild('mapContainer') mapContainer!: ElementRef<HTMLImageElement>;
  @ViewChild('toggleButton') toggleButton!: ElementRef<HTMLButtonElement>;

  private _uiStateService = inject(UiStateService);
  private _stallMapService = inject(StallMapService);
  private _stallService = inject(StallService);
  private _areaService = inject(AreaService);

  mapWidth = signal<number>(0);
  mapHeight = signal<number>(0);

  isMobile: WritableSignal<boolean> = signal<boolean>(false);
  isInitialLoading: WritableSignal<boolean> = signal<boolean>(true);
  isInitialError: WritableSignal<boolean> = signal<boolean>(false);
  errorMsg = '';

  allStalls$ = this._stallService.allStalls$;
  stallGridRefs = stallGridRefs;

  mapImageSrc = `https://cdn.jsdelivr.net/gh/v4724/nice-0816@c6b3cd1/assets/stalls-map.jpg`;

  // 場內 only 圖層
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
    this.mapImageLoaded.pipe().subscribe(() => {
      this._stallMapService.mapImage = this.mapImage.nativeElement;
      this._stallMapService.mapContainer = this.mapContainer.nativeElement;
    });
  }

  ngAfterViewInit() {
    this.runApp();

    this.mapWidth.set(this.mapImage.nativeElement.offsetWidth);
    this.mapHeight.set(this.mapImage.nativeElement.offsetHeight);
  }

  mapImageLoaded = new Subject<boolean>();

  onMapImageLoad() {
    this.mapImageLoaded.next(true);
    this.mapImageLoaded.complete();
  }

  onMapImageError() {
    this.mapImageLoaded.error(new Error('Map image failed to load.'));
    this.mapImageLoaded.complete();
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
    forkJoin([fetchExcelData(STALL_CSV_URL), this.mapImageLoaded])
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
      .subscribe(([rawData]) => {
        console.log();
        if (rawData.length === 0) {
          this.isInitialError.set(true);
          this.errorMsg = '載入失敗';
          return;
        }

        const allStalls = processStalls(rawData);
        this._stallService.allStalls = allStalls;

        // --- Initialization & Setup ---
        const mobileCheck = this._uiStateService.isSmallScreen();
        this.isMobile.set(mobileCheck);

        // --- UI Rendering ---
        // this.renderStalls();
        // renderDebugBorders(this.mapContainer);
      });
  }

  /** Handles interactions on the main map, ignoring those on the magnifier. */
  mapContainerMousedown(e: MouseEvent | TouchEvent) {
    e.stopPropagation();
    const target = e.target as HTMLElement;

    // If the interaction started inside the magnifier, do nothing here.
    // The magnifier's own event listeners in magnifier.ts will handle it.
    if (target.closest('#magnifier-wrapper')) {
      return;
    }

    // For touch events on the map, prevent default to avoid scrolling/zooming
    // when the user intended to tap a stall.
    if (e.type === 'touchstart') {
      e.preventDefault();
    }

    this.handleAreaClick(target);
  }
  // Use touchstart for a responsive feel and to prevent default page actions.
  mapContainerTouchstart(e: TouchEvent) {
    if (!this.isMobile()) return;

    e.stopPropagation();
    this.mapContainerMousedown(e);
  }

  /** Handles opening the modal for a clicked stall or group area from any context (map or magnifier). */
  handleAreaClick(target: HTMLElement) {
    const allStalls = this._stallService.allStalls;
    const clickedGroupArea = target.closest('.stall-group-area') as HTMLElement | null;
    const clickedStallArea = target.closest(
      '.stall-area:not(.stall-group-area)',
    ) as HTMLElement | null;

    if (clickedGroupArea?.dataset['rowId']) {
      const rowId = clickedGroupArea.dataset['rowId'];
      // Find the first stall in the row (top-most for vertical rows) and open its modal directly.
      const stallsInRow = allStalls
        .filter((s) => s.id.startsWith(rowId))
        .sort((a, b) => b.num - a.num); // Sort by number descending.

      if (stallsInRow.length > 0) {
        this.openModal(stallsInRow[0].id);
      }
    } else if (clickedStallArea?.dataset['stallId']) {
      this.openModal(clickedStallArea.dataset['stallId']);
    }
  }

  openModal(stallId: string) {
    this.stallModal.updateStallInfo(stallId);
  }

  toggleMagnifier() {
    if (!this.magnifier.hidden()) {
      this.toggleButton.nativeElement.setAttribute('aria-pressed', 'false');
      this.toggleButton.nativeElement.textContent = '顯示放大鏡';
      this.magnifier.hide();
    } else {
      this.toggleButton.nativeElement.setAttribute('aria-pressed', 'true'); // For accessibility
      this.toggleButton.nativeElement.textContent = '隱藏放大鏡';
      this.magnifier.show();
    }
  }

  @HostListener('mousemove', ['$event'])
  mousemoveHandler(e: MouseEvent) {
    if (!this.isMobile()) {
      return;
    }
    if (this._stallService.selected) return;
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
