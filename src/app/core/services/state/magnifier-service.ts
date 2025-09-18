import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { StallDto } from '../../interfaces/stall-dto.interface';
import { StallData } from 'src/app/components/stall/stall-.interface';

@Injectable({
  providedIn: 'root',
})
export class MagnifierService {
  private _rowIndicatorNext = new BehaviorSubject<string>('');
  private _rowIndicatorCurrent = new BehaviorSubject<string>('');
  private _rowIndicatorPrev = new BehaviorSubject<string>('');
  rowIndicatorNext$ = this._rowIndicatorNext.asObservable();
  rowIndicatorCurrent$ = this._rowIndicatorCurrent.asObservable();
  rowIndicatorPrev$ = this._rowIndicatorPrev.asObservable();

  stallIdToOriginalMap = new Map<string, HTMLElement>();
  stallIdToCloneMap = new Map<string, HTMLElement>();

  isShownState = false;

  setRowIndicator(prev: string, curr: string, next: string) {
    this._rowIndicatorPrev.next(prev);
    this._rowIndicatorCurrent.next(curr);
    this._rowIndicatorNext.next(next);
  }

  /** Adds a stall element and its clone to the magnifier system. */
  addStall(stallElement) {
    const stallId = stallElement.dataset['stallId'];
    if (!stallId) return;

    // Store references to both the original and the clone for synchronization.
    this.stallIdToOriginalMap.set(stallId, stallElement);
    this.stallIdToCloneMap.set(stallId, clone);
  }

  /** Adds a group area element and its clone to the magnifier's stall layer. */
  addGroupArea(groupElement: HTMLElement) {
    const clone = groupElement.cloneNode(true) as HTMLElement;
    magnifierStallLayer.appendChild(clone);
  }

  /** Updates a class on both the original stall and its clone using the stall's ID. */
  updateStallClass(stallId: string, className: string, force: boolean) {
    // Find the original stall on the main map.
    const original = this.stallIdToOriginalMap.get(stallId);
    if (original) {
      original.classList.toggle(className, force);
    }

    // Find the cloned stall in the magnifier.
    const clone = this.stallIdToCloneMap.get(stallId);
    if (clone) {
      clone.classList.toggle(className, force);
    }
  }

  /** Shows the magnifier. */
  show() {
    this.isShownState = true;

    // Configure magnifier properties right before showing it to ensure
    // the map image's dimensions are loaded and correct.
    magnifier.style.backgroundSize = `${mapImage.offsetWidth * zoomFactor}px ${
      mapImage.offsetHeight * zoomFactor
    }px`;
    magnifier.style.backgroundImage = `url('${mapImage.src}')`;

    // Configure the cloned stall layer to match the map and apply scaling.
    magnifierStallLayer.style.width = `${mapImage.offsetWidth}px`;
    magnifierStallLayer.style.height = `${mapImage.offsetHeight}px`;
    magnifierStallLayer.style.transform = `scale(${zoomFactor})`;

    magnifierWrapper.style.display = 'block';

    // --- Center magnifier on first show ---
    // If it's the first time, position it in the middle of the map.
    if (!hasBeenPositioned) {
      const mapWidth = mapContainer.offsetWidth;
      const mapHeight = mapContainer.offsetHeight;
      const lensWidth = magnifierWrapper.offsetWidth;
      const lensHeight = magnifierWrapper.offsetHeight;

      setPosition((mapWidth - lensWidth) / 2, (mapHeight - lensHeight) / 2);
      hasBeenPositioned = true; // Set flag so it doesn't re-center again.
    }

    toggleButton.setAttribute('aria-pressed', 'true'); // For accessibility
    toggleButton.textContent = '隱藏放大鏡';
    updateZoom(); // Perform initial zoom update.
  }

  /** Hides the magnifier. */
  hide() {
    this.isShownState = false;
    magnifierWrapper.style.display = 'none';
    toggleButton.setAttribute('aria-pressed', 'false');
    toggleButton.textContent = '顯示放大鏡';
  }

  /** Toggles the visibility of the magnifier. */
  toggle() {
    if (this.isShownState) {
      this.hide();
    } else {
      this.show();
    }
  }

  /** Returns true if the magnifier is currently visible. */
  isShown() {
    return this.isShownState;
  }
}
