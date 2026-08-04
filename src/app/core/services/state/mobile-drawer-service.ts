import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { DrawerOnMobile } from 'src/app/shared/components/drawer-on-mobile/drawer-on-mobile';

export type MobileDrawer = 'filterResults' | 'bookmarkList' | '';

// 未完成
@Injectable({
  providedIn: 'root',
})
export class MobileDrawerService {
  private _show = new BehaviorSubject<MobileDrawer>('');
  private _drawer = new BehaviorSubject<DrawerOnMobile | undefined>(undefined);
  show$ = this._show.asObservable();
  drawer$ = this._drawer.asObservable();

  get curr(): MobileDrawer {
    return this._show.getValue();
  }

  toggle(layer: MobileDrawer) {
    const currLayer = this.curr;
    if (layer === currLayer) {
      this._show.next('');
    } else {
      this._show.next(layer);
    }
  }

  show(layer: MobileDrawer, drawer: DrawerOnMobile) {
    this._show.next(layer);
    this._drawer.next(drawer);
  }
}
