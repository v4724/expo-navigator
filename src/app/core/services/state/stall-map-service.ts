import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class StallMapService {
  private _mapImage = new BehaviorSubject<HTMLImageElement | null>(null);
  private _mapContainer = new BehaviorSubject<HTMLElement | null>(null);

  mapImage$ = this._mapImage.asObservable();
  mapContainer$ = this._mapContainer.asObservable();

  set mapImage(el: HTMLImageElement) {
    this._mapImage.next(el);
  }

  get mapImage(): HTMLImageElement | null {
    return this._mapImage.getValue();
  }

  set mapContainer(el: HTMLElement) {
    this._mapContainer.next(el);
  }

  get mapContainer(): HTMLElement | null {
    return this._mapContainer.getValue();
  }
}
