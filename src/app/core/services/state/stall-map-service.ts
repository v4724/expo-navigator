import { Injectable } from '@angular/core';
import { BehaviorSubject, Subject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class StallMapService {
  private _mapImage = new BehaviorSubject<HTMLImageElement | null>(null);
  private _mapContentWH = new BehaviorSubject<{ w: number; h: number }>({ w: 0, h: 0 });
  private _mapContainer = new BehaviorSubject<HTMLElement | null>(null);
  private _mapContent = new BehaviorSubject<HTMLElement | null>(null);
  private _mapContentScale = new BehaviorSubject<number>(1);
  private _matchStallsId = new BehaviorSubject<Map<string, Set<string>>>(
    new Map<string, Set<string>>(),
  );
  private _focus = new BehaviorSubject<string>('');

  mapImage$ = this._mapImage.asObservable();
  mapContentWH$ = this._mapContentWH.asObservable();
  mapContainer$ = this._mapContainer.asObservable();
  mapContent$ = this._mapContent.asObservable();
  mapContentScale$ = this._mapContentScale.asObservable();
  matchStallsId$ = this._matchStallsId.asObservable();
  focus$ = this._focus.asObservable();

  set mapImage(el: HTMLImageElement) {
    this._mapImage.next(el);
  }

  set mapContentWH({ w, h }: { w: number; h: number }) {
    this._mapContentWH.next({ w, h });
  }

  set mapContainer(el: HTMLElement) {
    this._mapContainer.next(el);
  }

  set mapContent(el: HTMLElement) {
    this._mapContent.next(el);
  }

  set mapContentScale(val: number) {
    this._mapContentScale.next(val);
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

  get mapContentWH(): { w: number; h: number } {
    return this._mapContentWH.getValue();
  }

  get mapImage(): HTMLImageElement | null {
    return this._mapImage.getValue();
  }

  get mapContentScale(): number {
    return this._mapContentScale.getValue();
  }

  focusStall(stallId: string) {
    this._focus.next(stallId);
  }
}
