import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class StallModalService {
  private _showStallModal = new BehaviorSubject<boolean>(false);
  showStallModal$ = this._showStallModal.asObservable();

  isShow() {
    return this._showStallModal.getValue();
  }
  isHidden() {
    return !this._showStallModal.getValue();
  }

  toggleStallModal() {
    this._showStallModal.next(!this._showStallModal.value);
  }

  show() {
    this._showStallModal.next(true);
  }

  hide() {
    this._showStallModal.next(false);
  }
}
