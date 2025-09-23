import { CommonModule } from '@angular/common';
import {
  AfterViewInit,
  Component,
  ElementRef,
  HostListener,
  inject,
  NgZone,
  OnInit,
  Renderer2,
  signal,
  ViewChild,
} from '@angular/core';
import { stallGridRefs } from 'src/app/core/const/official-data';
import { allGroupIds } from 'src/app/core/const/row-id';
import { MagnifierService } from 'src/app/core/services/state/magnifier-service';
import { StallMapService } from 'src/app/core/services/state/stall-map-service';
import { StallModalService } from 'src/app/core/services/state/stall-modal-service';
import { StallService } from 'src/app/core/services/state/stall-service';
import { UiStateService } from 'src/app/core/services/state/ui-state-service';
import { Stall } from '../stall/stall';
import { StallGroupArea } from '../stall-group-area/stall-group-area';
import { GroupIndicator } from '../group-indicator/group-indicator';
import { After } from 'v8';
import { Draggable, TargetXY } from 'src/app/core/directives/draggable';

@Component({
  selector: 'app-magnifier',
  imports: [CommonModule, Stall, StallGroupArea, GroupIndicator, Draggable],
  templateUrl: './magnifier.html',
  styleUrl: './magnifier.scss',
})
export class Magnifier implements AfterViewInit {
  @ViewChild('magnifier') magnifier!: ElementRef<HTMLElement>;
  @ViewChild('magnifierWrapper') magnifierWrapper!: ElementRef<HTMLElement>;
  @ViewChild('magnifierStallLayer') magnifierStallLayer!: ElementRef<HTMLElement>;
  @ViewChild('indicatorContainer') indicatorContainer!: ElementRef<HTMLElement>;

  zoomFactor = 2.5;
  hasBeenPositioned = false; // Flag to center the magnifier only once.

  private _uiStateService = inject(UiStateService);
  private _stallMapService = inject(StallMapService);
  private _stallService = inject(StallService);
  private _stallModalService = inject(StallModalService);
  private _magnifierService = inject(MagnifierService);
  private _renderer = inject(Renderer2);

  hidden = signal<boolean>(false);
  mapImageSrc = signal('');
  mapImgW = signal<number>(0);
  mapImgH = signal<number>(0);
  scaleMapImgW = signal<number>(0);
  scaleMapImgH = signal<number>(0);

  allStalls$ = this._stallService.allStalls$;
  stallGridRefs = stallGridRefs;

  constructor() {
    this.zoomFactor = this._uiStateService.isMobile() ? 3.5 : 2.5; // Use a higher zoom for mobile.
  }

  get mapContainer(): HTMLElement | null {
    return this._stallMapService.mapContainer;
  }
  get mapImage(): HTMLImageElement | null {
    return this._stallMapService.mapImage;
  }

  ngAfterViewInit() {
    this._stallMapService.mapImage$.pipe().subscribe((el) => {
      this.mapImageSrc.set(`url('${el?.src}')`);
    });
  }

  /**
   * Sets the magnifier's position, clamps it within bounds, and updates the zoom.
   * It also ensures the row indicator remains visible without being clipped by the map edges.
   * @param newLeft The target left position.
   * @param newTop The target top position.
   */
  setPosition(targetXY: TargetXY) {
    const newLeft = targetXY.x;
    const newTop = targetXY.y;
    const lensWidth = this.magnifierWrapper.nativeElement.offsetWidth;
    const lensHeight = this.magnifierWrapper.nativeElement.offsetHeight;
    const mapWidth = this.mapContainer?.offsetWidth ?? 0;
    const mapHeight = this.mapContainer?.offsetHeight ?? 0;

    // Clamp the magnifier's position so it's always at least partially on the map.
    const minLeft = -lensWidth / 2;
    const minTop = -lensHeight / 2;
    const maxLeft = mapWidth - lensWidth / 2;
    const maxTop = mapHeight - lensHeight / 2;

    const clampedLeft = Math.max(minLeft, Math.min(newLeft, maxLeft));
    const clampedTop = Math.max(minTop, Math.min(newTop, maxTop));

    this.magnifierWrapper.nativeElement.style.left = `${clampedLeft}px`;
    this.magnifierWrapper.nativeElement.style.top = `${clampedTop}px`;
    // console.debug('放大鏡 setPosition left, top', clampedLeft, clampedTop);
    requestAnimationFrame(() => {
      this.updateZoom();
    });
  }

  /**
   * Calculates and applies the zoom effect by updating the background position
   * of the magnifier lens and the position of the cloned stall layer.
   */
  updateZoom() {
    const lensWidth = this.magnifierWrapper.nativeElement.offsetWidth;
    const lensHeight = this.magnifierWrapper.nativeElement.offsetHeight;

    // The center point of the lens relative to the map container.
    const lensCenterX = this.magnifierWrapper.nativeElement.offsetLeft + lensWidth / 2;
    const lensCenterY = this.magnifierWrapper.nativeElement.offsetTop + lensHeight / 2;

    // Calculate the position of the background image inside the lens.
    // This is the core of the zoom effect.
    const bgX = -(lensCenterX * this.zoomFactor - lensWidth / 2);
    const bgY = -(lensCenterY * this.zoomFactor - lensHeight / 2);

    // Move both the background image and the cloned stall layer to keep them in sync.
    this.magnifier.nativeElement.style.backgroundPosition = `${bgX}px ${bgY}px`;
    this._renderer.setStyle(
      this.magnifierStallLayer.nativeElement,
      'transform',
      `translate(${bgX}px, ${bgY}px) scale(${this.zoomFactor})`,
    );

    // console.debug('updateZoom 更新放大鏡內容座標', bgX, bgY);
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
      ((this.magnifierWrapper.nativeElement.offsetLeft +
        this.magnifierWrapper.nativeElement.offsetWidth / 2) /
        mapWidth) *
      100;
    const lensCenterY_pct =
      ((this.magnifierWrapper.nativeElement.offsetTop +
        this.magnifierWrapper.nativeElement.offsetHeight / 2) /
        mapHeight) *
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
        lensCenterX_pct - row.boundingBox.right,
      );
      const dy = Math.max(
        row.boundingBox.top - lensCenterY_pct,
        0,
        lensCenterY_pct - row.boundingBox.bottom,
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
    const offsetWidth = this.mapImage?.offsetWidth ?? 0;
    const offsetHeight = this.mapImage?.offsetHeight ?? 0;

    // Configure magnifier properties right before showing it to ensure
    // the map image's dimensions are loaded and correct.
    const scaledMapW = offsetWidth * this.zoomFactor;
    const scaledMapH = offsetHeight * this.zoomFactor;

    this.mapImgW.set(offsetWidth);
    this.mapImgH.set(offsetHeight);

    this.scaleMapImgW.set(scaledMapW);
    this.scaleMapImgH.set(scaledMapH);

    // Configure the cloned stall layer to match the map and apply scaling.
    this.magnifierStallLayer.nativeElement.style.width = `${offsetWidth}px`;
    this.magnifierStallLayer.nativeElement.style.height = `${offsetHeight}px`;
    this.magnifierStallLayer.nativeElement.style.transform = `scale(${this.zoomFactor})`;

    this.hidden.set(false);

    // Perform initial zoom update.
    requestAnimationFrame(() => {
      // --- Center magnifier on first show ---
      // If it's the first time, position it in the middle of the map.
      if (!this.hasBeenPositioned) {
        const mapWidth = offsetWidth;
        const mapHeight = offsetHeight;
        const lensWidth = this.magnifierWrapper.nativeElement.offsetWidth;
        const lensHeight = this.magnifierWrapper.nativeElement.offsetHeight;
        const targetXY = { x: (mapWidth - lensWidth) / 2, y: (mapHeight - lensHeight) / 2 };
        this.setPosition(targetXY);
        this.hasBeenPositioned = true; // Set flag so it doesn't re-center again.
      }
      this.updateZoom();
    });
  }

  /** Hides the magnifier. */
  hide() {
    this.hidden.set(true);
  }
}
