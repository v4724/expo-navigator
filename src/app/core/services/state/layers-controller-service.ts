import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class LayersControllerService {
  private _show = new BehaviorSubject<boolean>(false);
  show$ = this._show.asObservable();

  toggle() {
    this._show.next(!this._show.getValue());
  }
}
