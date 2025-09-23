import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class DraggableService {
  private _isDragging = new BehaviorSubject<boolean>(false);
  isDragging$ = this._isDragging.asObservable();

  set isDragging(val: boolean) {
    this._isDragging.next(val);
  }

  get isDragging() {
    return this._isDragging.getValue();
  }
}
