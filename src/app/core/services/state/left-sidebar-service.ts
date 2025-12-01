import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export type SidebarType = 'layerControl' | 'filterResults' | 'advancedFilter' | 'bookmarkList' | '';

@Injectable({
  providedIn: 'root',
})
export class LeftSidebarService {
  private _show = new BehaviorSubject<SidebarType>('');
  show$ = this._show.asObservable();

  get curr(): SidebarType {
    return this._show.getValue();
  }

  toggle(layer: SidebarType) {
    const currLayer = this.curr;
    if (layer === currLayer) {
      this._show.next('');
    } else {
      this._show.next(layer);
    }
  }

  show(layer: SidebarType) {
    this._show.next(layer);
  }
}
