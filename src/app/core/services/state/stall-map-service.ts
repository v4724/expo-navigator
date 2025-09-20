import { Injectable } from '@angular/core';
import { BehaviorSubject, Subject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class StallMapService {
  private _mapImage = new BehaviorSubject<HTMLImageElement | null>(null);
  private _mapContainer = new BehaviorSubject<HTMLElement | null>(null);
  private _inputSearch = new BehaviorSubject<string>('');
  private _inputSearchMatchGroupId = new Subject<string>();

  mapImage$ = this._mapImage.asObservable();
  mapContainer$ = this._mapContainer.asObservable();
  inputSearch$ = this._inputSearch.asObservable();
  inputSearchMatchGroupId$ = this._inputSearchMatchGroupId.asObservable();

  set mapImage(el: HTMLImageElement) {
    this._mapImage.next(el);
  }

  set mapContainer(el: HTMLElement) {
    this._mapContainer.next(el);
  }

  set inputSearch(input: string) {
    this._inputSearch.next(input);
  }

  set inputSearchMatchGroupId(id: string) {
    this._inputSearchMatchGroupId.next(id);
  }

  get mapContainer(): HTMLElement | null {
    return this._mapContainer.getValue();
  }

  get mapImage(): HTMLImageElement | null {
    return this._mapImage.getValue();
  }
}
