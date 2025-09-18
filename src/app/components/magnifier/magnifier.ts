import { CommonModule } from '@angular/common';
import { Component, inject, ViewChild } from '@angular/core';
import { stallGridRefs } from 'src/app/core/const/official-data';
import { allGroupIds } from 'src/app/core/const/row-id';
import { MagnifierService } from 'src/app/core/services/state/magnifier-service';
import { StallMapService } from 'src/app/core/services/state/stall-map-service';
import { StallModalService } from 'src/app/core/services/state/stall-modal-service';
import { StallService } from 'src/app/core/services/state/stall-service';
import { UiStateService } from 'src/app/core/services/state/ui-state-service';
import { Stall } from '../stall/stall';
import { StallGroupArea } from '../stall-group-area/stall-group-area';

@Component({
  selector: 'app-magnifier',
  imports: [CommonModule, Stall, StallGroupArea],
  templateUrl: './magnifier.html',
  styleUrl: './magnifier.scss',
})
export class Magnifier {
  @ViewChild('magnifier') magnifier!: HTMLElement;
  @ViewChild('magnifierWrapper') magnifierWrapper!: HTMLElement;
  @ViewChild('magnifierStallLayer') magnifierStallLayer!: HTMLElement;
  @ViewChild('indicatorContainer') indicatorContainer!: HTMLElement;

  isShownState = false;
  zoomFactor = 2.5;
  isDragging = false;
  hasBeenPositioned = false; // Flag to center the magnifier only once.
  // Variables to track drag state.
  dragStartX = 0;
  dragStartY = 0;
  initialLensX = 0;
  initialLensY = 0;
  dragHappened = false; // Differentiates a click from a drag.
  clickTarget: HTMLElement | null = null; // The element that was initially clicked.

  mapContainer: HTMLElement | null = null;
  mapImage: HTMLImageElement | null = null;

  private _uiStateService = inject(UiStateService);
  private _stallMapService = inject(StallMapService);
  private _stallService = inject(StallService);
  private _stallModalService = inject(StallModalService);
  private _magnifierService = inject(MagnifierService);

  rowIndicatorNext$ = this._magnifierService.rowIndicatorNext$;
  rowIndicatorCurrent$ = this._magnifierService.rowIndicatorCurrent$;
  rowIndicatorPrev$ = this._magnifierService.rowIndicatorPrev$;

  allStalls$ = this._stallService.allStalls$;
  stallGridRefs = stallGridRefs;

  constructor() {
    this.zoomFactor = this._uiStateService.isMobile() ? 3.5 : 2.5; // Use a higher zoom for mobile.
  }

  ngOnInit() {
    this._stallMapService.mapContainer$.subscribe((mapContainer) => {
      this.mapContainer = mapContainer;
    });
    this._stallMapService.mapImage$.subscribe((mapImage) => {
      this.mapImage = mapImage;
    });
  }

  // --- Unified Drag and Interaction Handlers for Mouse and Touch ---
  onDragStart(e: MouseEvent | TouchEvent) {
    e.preventDefault();

    this.isDragging = true;
    this.dragHappened = false; // Reset for the new interaction.
    this.clickTarget = e.target as HTMLElement; // Store the initial target.

    const touch = (e as TouchEvent).touches?.[0];
    const clientX = touch ? touch.clientX : (e as MouseEvent).clientX;
    const clientY = touch ? touch.clientY : (e as MouseEvent).clientY;

    // Record the starting position of the mouse/touch and the lens.
    this.dragStartX = clientX;
    this.dragStartY = clientY;
    this.initialLensX = this.magnifierWrapper.offsetLeft;
    this.initialLensY = this.magnifierWrapper.offsetTop;
  }

  onTouchStart(e: TouchEvent) {
    e.stopPropagation();
    e.preventDefault();
    this.onDragStart(e);
  }

  onDragMove(e: MouseEvent | TouchEvent) {
    if (!this.isDragging) return;

    const touch = (e as TouchEvent).touches?.[0];
    const clientX = touch ? touch.clientX : (e as MouseEvent).clientX;
    const clientY = touch ? touch.clientY : (e as MouseEvent).clientY;

    const dx = clientX - this.dragStartX; // Change in mouse/touch X.
    const dy = clientY - this.dragStartY; // Change in mouse/touch Y.

    // Check if movement exceeds a threshold to be considered a drag.
    if (!this.dragHappened && (Math.abs(dx) > 5 || Math.abs(dy) > 5)) {
      this.dragHappened = true;
    }

    this.setPosition(this.initialLensX + dx, this.initialLensY + dy);
  }

  onTouchMove(e: TouchEvent) {
    e.stopPropagation();
    e.preventDefault();
    this.onDragMove(e);
  }

  onDragEnd() {
    if (!this.isDragging) return;
    this.isDragging = false;

    // If no significant movement happened, it's a click.
    if (!this.dragHappened && this.clickTarget) {
      const clickedArea = this.clickTarget.closest('.stall-area');
      if (clickedArea) {
        // Delegate to the main click handler.
        this.onAreaClick(this.clickTarget);
      }
    }
    this.clickTarget = null; // Clear the stored target.
  }

  /** Handles opening the modal for a clicked stall or group area from any context (map or magnifier). */
  onAreaClick(target: HTMLElement) {
    const clickedGroupArea = target.closest('.stall-group-area') as HTMLElement | null;
    const clickedStallArea = target.closest(
      '.stall-area:not(.stall-group-area)'
    ) as HTMLElement | null;

    if (clickedGroupArea?.dataset['rowId']) {
      const rowId = clickedGroupArea.dataset['rowId'];
      // Find the first stall in the row (top-most for vertical rows) and open its modal directly.
      const stallsInRow = this._stallService.allStalls
        .filter((s) => s.id.startsWith(rowId))
        .sort((a, b) => b.num - a.num); // Sort by number descending.

      if (stallsInRow.length > 0) {
        this._stallService.selected = stallsInRow[0].id;
      }
    } else if (clickedStallArea?.dataset['stallId']) {
      this._stallService.selected = clickedStallArea.dataset['stallId'];
    }
  }

  /**
   * Sets the magnifier's position, clamps it within bounds, and updates the zoom.
   * It also ensures the row indicator remains visible without being clipped by the map edges.
   * @param newLeft The target left position.
   * @param newTop The target top position.
   */
  setPosition(newLeft: number, newTop: number) {
    const lensWidth = this.magnifierWrapper.offsetWidth;
    const lensHeight = this.magnifierWrapper.offsetHeight;
    const mapWidth = this.mapContainer?.offsetWidth ?? 0;
    const mapHeight = this.mapContainer?.offsetHeight ?? 0;

    // Clamp the magnifier's position so it's always at least partially on the map.
    const minLeft = -lensWidth / 2;
    const minTop = -lensHeight / 2;
    const maxLeft = mapWidth - lensWidth / 2;
    const maxTop = mapHeight - lensHeight / 2;

    const clampedLeft = Math.max(minLeft, Math.min(newLeft, maxLeft));
    const clampedTop = Math.max(minTop, Math.min(newTop, maxTop));

    this.magnifierWrapper.style.left = `${clampedLeft}px`;
    this.magnifierWrapper.style.top = `${clampedTop}px`;

    // Keep the row indicator container pinned within the visible map area.
    const indicatorContainer = this.indicatorContainer;
    if (indicatorContainer) {
      const indicatorWidth = indicatorContainer.offsetWidth;
      let shiftX = 0;

      // If magnifier is off the left edge, shift indicator to the right to stay visible.
      if (clampedLeft < 0) {
        shiftX = -clampedLeft; // `clampedLeft` is negative, so this is a positive shift.
      }
      // If magnifier indicator is off the right edge, shift it to the left.
      else if (clampedLeft + indicatorWidth > mapWidth) {
        shiftX = mapWidth - (clampedLeft + indicatorWidth); // This will be a negative shift.
      }

      indicatorContainer.style.transform = `translateX(${shiftX}px) translateY(-50%)`;
    }

    this.updateZoom();
  }

  /**
   * Calculates and applies the zoom effect by updating the background position
   * of the magnifier lens and the position of the cloned stall layer.
   */
  updateZoom() {
    const lensWidth = this.magnifierWrapper.offsetWidth;
    const lensHeight = this.magnifierWrapper.offsetHeight;

    // The center point of the lens relative to the map container.
    const lensCenterX = this.magnifierWrapper.offsetLeft + lensWidth / 2;
    const lensCenterY = this.magnifierWrapper.offsetTop + lensHeight / 2;

    // Calculate the position of the background image inside the lens.
    // This is the core of the zoom effect.
    const bgX = -(lensCenterX * this.zoomFactor - lensWidth / 2);
    const bgY = -(lensCenterY * this.zoomFactor - lensHeight / 2);

    // Move both the background image and the cloned stall layer to keep them in sync.
    this.magnifier.style.backgroundPosition = `${bgX}px ${bgY}px`;
    this.magnifierStallLayer.style.left = `${bgX}px`;
    this.magnifierStallLayer.style.top = `${bgY}px`;
    this.updateRowIndicator();
  }

  /**
   * Finds the closest row to the magnifier's center and updates the indicator elements.
   * It hides the indicator if the magnifier is outside the vertical bounds of all stall rows.
   */
  updateRowIndicator() {
    const mapWidth = this.mapContainer?.offsetWidth ?? 0;
    const mapHeight = this.mapContainer?.offsetHeight ?? 0;
    if (mapWidth === 0 || mapHeight === 0) return;

    const lensCenterX_pct =
      ((this.magnifierWrapper.offsetLeft + this.magnifierWrapper.offsetWidth / 2) / mapWidth) * 100;
    const lensCenterY_pct =
      ((this.magnifierWrapper.offsetTop + this.magnifierWrapper.offsetHeight / 2) / mapHeight) *
      100;

    // Boundaries for showing the indicator based on the top-most and bottom-most stall rows.
    const TOP_VISIBLE_BOUNDARY_Y = 9.15;
    const BOTTOM_VISIBLE_BOUNDARY_Y = 89.2;

    // Hide indicator if magnifier is above the top row or below the bottom row.
    if (lensCenterY_pct < TOP_VISIBLE_BOUNDARY_Y || lensCenterY_pct > BOTTOM_VISIBLE_BOUNDARY_Y) {
      this._magnifierService.setRowIndicator('', '', '');
      return;
    }

    let closestRowData: (typeof stallGridRefs)[0] | null = null;
    let minDistanceSq = Infinity;

    // Find the row that is geometrically closest to the magnifier's center. This prevents flickering in aisles.
    for (const row of stallGridRefs) {
      const dx = Math.max(
        row.boundingBox.left - lensCenterX_pct,
        0,
        lensCenterX_pct - row.boundingBox.right
      );
      const dy = Math.max(
        row.boundingBox.top - lensCenterY_pct,
        0,
        lensCenterY_pct - row.boundingBox.bottom
      );
      const distanceSq = dx * dx + dy * dy;

      if (distanceSq < minDistanceSq) {
        minDistanceSq = distanceSq;
        closestRowData = row;
      }
    }

    if (closestRowData) {
      const currentIndex = allGroupIds.indexOf(closestRowData.groupId);
      const current = closestRowData.groupId;
      const prev = currentIndex > 0 ? allGroupIds[currentIndex - 1] : '';
      const next = currentIndex < allGroupIds.length - 1 ? allGroupIds[currentIndex + 1] : '';
      this._magnifierService.setRowIndicator(prev, current, next);
    } else {
      // This case is a fallback, but should not be reached with the current logic.
      this._magnifierService.setRowIndicator('', '', '');
    }
  }

  /** Shows the magnifier. */
  show() {
    this.isShownState = true;
    const offsetWidth = this.mapImage?.offsetWidth ?? 0;
    const offsetHeight = this.mapImage?.offsetHeight ?? 0;

    // Configure magnifier properties right before showing it to ensure
    // the map image's dimensions are loaded and correct.
    this.magnifier.style.backgroundSize = `${offsetWidth * this.zoomFactor}px ${
      offsetHeight * this.zoomFactor
    }px`;
    this.magnifier.style.backgroundImage = `url('${this.mapImage?.src}')`;

    // Configure the cloned stall layer to match the map and apply scaling.
    this.magnifierStallLayer.style.width = `${offsetWidth}px`;
    this.magnifierStallLayer.style.height = `${offsetHeight}px`;
    this.magnifierStallLayer.style.transform = `scale(${this.zoomFactor})`;

    this.magnifierWrapper.style.display = 'block';

    // --- Center magnifier on first show ---
    // If it's the first time, position it in the middle of the map.
    if (!this.hasBeenPositioned) {
      const mapWidth = offsetWidth;
      const mapHeight = offsetHeight;
      const lensWidth = this.magnifierWrapper.offsetWidth;
      const lensHeight = this.magnifierWrapper.offsetHeight;

      this.setPosition((mapWidth - lensWidth) / 2, (mapHeight - lensHeight) / 2);
      this.hasBeenPositioned = true; // Set flag so it doesn't re-center again.
    }

    this.updateZoom(); // Perform initial zoom update.
  }
  /** Hides the magnifier. */
  hide() {
    this.isShownState = false;
    this.magnifierWrapper.style.display = 'none';
  }

  /** Returns true if the magnifier is currently visible. */
  isShown() {
    return this.isShownState;
  }
}
