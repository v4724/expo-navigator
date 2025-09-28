import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class StallLayerService {
  private _show = new BehaviorSubject<boolean>(true);

  show$ = this._show.asObservable();

  constructor() {}

  toggleLayer() {
    this._show.next(!this._show.getValue());
  }
}
