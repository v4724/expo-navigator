import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

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

  /** Returns true if the magnifier is currently visible. */
  isShown() {
    return this.isShownState;
  }
}
