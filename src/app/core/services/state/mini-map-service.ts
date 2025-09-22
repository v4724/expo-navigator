import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class MiniMapService {
  private _isPanning = new BehaviorSubject<boolean>(false);
  isPanning$ = this._isPanning.asObservable();

  set isPanning(val: boolean) {
    this._isPanning.next(val);
  }

  get isPanning() {
    return this._isPanning.getValue();
  }
}
