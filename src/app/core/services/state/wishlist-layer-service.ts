import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class WishlistLayerService {
  private _checkedIds = new BehaviorSubject<Set<string>>(new Set());
  private _show = new BehaviorSubject<boolean>(false);

  show$ = this._show.asObservable();
  checkedIds$ = this._checkedIds.asObservable();

  get checkedIds() {
    return this._checkedIds.getValue();
  }

  constructor() {}

  toggleLayer() {
    this._show.next(!this._show.getValue());
  }

  toggleWishlistItem(id: string) {
    const newCats = new Set(this._checkedIds.getValue());
    if (newCats.has(id)) {
      newCats.delete(id);
    } else {
      newCats.add(id);
    }
    this._checkedIds.next(newCats);
  }
}
