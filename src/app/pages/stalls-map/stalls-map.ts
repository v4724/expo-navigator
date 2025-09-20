import {
  AfterViewInit,
  Component,
  ElementRef,
  HostListener,
  inject,
  OnInit,
  signal,
  ViewChild,
  WritableSignal,
} from '@angular/core';
import { fetchStallData } from '../../ts/data-loader';
import { processStalls } from '../../ts/stall-processor';
import { uiState } from '../../ts/ui-manager';
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
import { error } from 'console';
import { StallData } from 'src/app/components/stall/stall-.interface';
import { StallGroupGridRef } from 'src/app/core/interfaces/locate-stall.interface';

@Component({
  selector: 'app-stalls-map',
  imports: [Lightbox, StallModal, Tooptip, Magnifier, CommonModule, Stall, StallGroupArea],
  templateUrl: './stalls-map.html',
  styleUrl: './stalls-map.scss',
})
export class StallsMap implements OnInit, AfterViewInit {
  @ViewChild(Magnifier) magnifier!: Magnifier;
  @ViewChild(StallModal) stallModal!: StallModal;
  @ViewChild('mapImage') mapImage!: ElementRef<HTMLImageElement>;
  @ViewChild('mapContainer') mapContainer!: ElementRef<HTMLImageElement>;
  @ViewChild('toggleButton') toggleButton!: ElementRef<HTMLButtonElement>;
  @ViewChild('searchInput') searchInput!: ElementRef<HTMLInputElement>;

  private _uiStateService = inject(UiStateService);
  private _stallMapService = inject(StallMapService);
  private _stallService = inject(StallService);
  private _tooltipService = inject(TooltipService);

  isMobile: WritableSignal<boolean> = signal<boolean>(false);
  isInitialLoading: WritableSignal<boolean> = signal<boolean>(true);
  isInitialError: WritableSignal<boolean> = signal<boolean>(false);
  errorMsg = '';

  allStalls$ = this._stallService.allStalls$;
  stallGridRefs = stallGridRefs;

  mapImageSrc = `https://cdn.jsdelivr.net/gh/v4724/nice-0816@c6b3cd1/assets/stalls-map.jpg`;

  ngOnInit() {
    this.mapImageLoaded.pipe().subscribe(() => {
      this._stallMapService.mapImage = this.mapImage.nativeElement;
      this._stallMapService.mapContainer = this.mapContainer.nativeElement;
    });
  }

  ngAfterViewInit() {
    this.runApp();
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
    // const elements = getDOMElements();

    // To enable debug borders, add `?debug=true` to the URL.
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('debug') === 'true') {
      this.mapContainer.nativeElement.classList.add('debug-mode');
    }

    // --- Asynchronous Resource Loading ---
    forkJoin([fetchStallData(), this.mapImageLoaded])
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
        const mobileCheck = this._uiStateService.isMobile();
        this.isMobile.set(mobileCheck);

        // --- UI Rendering ---
        this.renderStalls();
        // renderDebugBorders(this.mapContainer);
      });
  }

  mapContainerMouseover(e: MouseEvent) {
    if (this.isMobile()) return;

    const allStalls = this._stallService.allStalls;
    const target = e.target as HTMLElement;
    const stallArea = target.closest('.stall-area:not(.stall-group-area)');
    if (stallArea && !uiState.selectedStallElement) {
      const stallId = (stallArea as HTMLElement).dataset['stallId'];
      const stall = allStalls.find((s) => s.id === stallId);
      if (stall) {
        const promoUsers = stall.promoData
          ?.map((o) => o.promoUser)
          .filter((value, index, self) => self.indexOf(value) === index)
          .join(',');
        const innerHTML = `<strong>${stall.stallTitle}</strong><br><small>${stall.id}${
          promoUsers ? ` / ${promoUsers}` : ''
        }</small>`;
        this._tooltipService.show(innerHTML, target);
      }
    }
  }

  mapContainerMouseout(e: MouseEvent) {
    if (this.isMobile()) return;

    const target = e.target as HTMLElement;
    if (target.classList.contains('stall-area')) {
      this._tooltipService.hide();
    }
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
    this.stallModal.openModal(stallId);
  }

  toggleMagnifier() {
    if (this.magnifier.isShownState) {
      this.toggleButton.nativeElement.setAttribute('aria-pressed', 'false');
      this.toggleButton.nativeElement.textContent = '顯示放大鏡';
      this.magnifier.hide();
    } else {
      this.toggleButton.nativeElement.setAttribute('aria-pressed', 'true'); // For accessibility
      this.toggleButton.nativeElement.textContent = '隱藏放大鏡';
      this.magnifier.show();
    }
  }

  input() {
    const searchTerm = this.searchInput.nativeElement.value.toLowerCase().trim();
    this._stallMapService.inputSearch = searchTerm;
  }

  /**
   * Renders all stall areas onto the map and creates clones for the magnifiers.
   * @param elements A reference to all DOM elements.
   * @param magnifierController The controller for the desktop magnifier.
   * @param state The shared UI state object.
   */
  renderStalls() {
    const allStalls = this._stallService.allStalls;
    // --- 1. Render all individual stall elements ---
    // They are created for logic, cloning, and desktop view. CSS will manage visibility.

    // --- 2. Create the visible, clickable group areas for ALL rows ---
    // Their visibility will be controlled by CSS based on screen size and whether they are permanently grouped.
    stallGridRefs.forEach((row) => {
      const groupArea = document.createElement('div');
      // Add both classes. `.stall-area` for base styles, `.stall-group-area` for group-specific styles.

      // If a row is NOT permanently grouped, its group area should be hidden by default on desktop.
      // CSS will make it visible on mobile devices.

      // For permanently grouped rows, ensure their group area is cloned into both
      // the main magnifier and the modal mini-map for visual consistency.
      if (row.isGrouped) {
        // Add to main magnifier
        // Add to modal mini-map
      }
    });
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
