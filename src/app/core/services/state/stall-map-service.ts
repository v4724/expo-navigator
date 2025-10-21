import { Injectable } from '@angular/core';
import { BehaviorSubject, Subject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class StallMapService {
  private _mapImage = new BehaviorSubject<HTMLImageElement | null>(null);
  private _mapContainer = new BehaviorSubject<HTMLElement | null>(null);
  private _matchStallsId = new BehaviorSubject<Map<string, Set<string>>>(
    new Map<string, Set<string>>(),
  );

  mapImage$ = this._mapImage.asObservable();
  mapContainer$ = this._mapContainer.asObservable();
  matchStallsId$ = this._matchStallsId.asObservable();

  set mapImage(el: HTMLImageElement) {
    this._mapImage.next(el);
  }

  set mapContainer(el: HTMLElement) {
    this._mapContainer.next(el);
  }

  updateMatchStallsId(groupId: string, stallId: string, isMatch: boolean) {
    const newCats = new Map(this._matchStallsId.getValue());

    if (!newCats.has(groupId)) {
      newCats.set(groupId, new Set());
    }

    const stallSet = newCats.get(groupId);
    if (isMatch) {
      stallSet?.add(stallId);
    } else {
      stallSet?.delete(stallId);
    }

    this._matchStallsId.next(newCats);
  }

  get mapContainer(): HTMLElement | null {
    return this._mapContainer.getValue();
  }

  get mapImage(): HTMLImageElement | null {
    return this._mapImage.getValue();
  }
}
