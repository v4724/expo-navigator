import { inject, Injectable } from '@angular/core';
import { BehaviorSubject, filter, forkJoin, switchMap, take } from 'rxjs';
import { fetchExcelData } from 'src/app/utils/google-excel-data-loader';
import { ExpoStateService } from './expo-state-service';
import { WishlistItemDto } from '../../models/wishlist-item.model';

@Injectable({
  providedIn: 'root',
})
export class WishlistService {
  expoDef = new Map<string, any>();
  allWishlistItems = new Map<string, WishlistItemDto>();

  private _fetchEnd = new BehaviorSubject<boolean>(false);
  fetchEnd$ = this._fetchEnd.asObservable();

  private _expoStateService = inject(ExpoStateService);

  get cnt(): number {
    return this.allWishlistItems.size;
  }

  constructor() {
    forkJoin([
      this._expoStateService.wishlistUrl$.pipe(
        filter((val) => !!val),
        take(1),
      ),
    ])
      .pipe(
        switchMap(([wishlistUrl]) => {
          return forkJoin([fetchExcelData(wishlistUrl)]);
        }),
      )
      .subscribe(([wishlist]) => {
        this.processWishlist(wishlist);
        this._fetchEnd.next(true);
      });
  }

  processWishlist(rawData: Record<string, string>[]) {
    rawData.forEach((rawSeries) => {
      const id = rawSeries['id'];
      const name = rawSeries['name'];
      const data = rawSeries['data'];
      const html = rawSeries['html'];
      const url = rawSeries['url'];
      const tag = rawSeries['tag'];
      const fillColor = rawSeries['fillColor'];
      const permission = rawSeries['permission'];

      if (!id || !name || !data || !url || !fillColor) {
        console.warn('wishlist item 缺少設定', id, name, data, html, url, fillColor);
        return;
      }

      if (!this.allWishlistItems.has(id)) {
        const item: WishlistItemDto = {
          id,
          name,
          data,
          html,
          url,
          fillColor,
          tag,
          permission: permission === 'TRUE' ? true : false,
        };

        if (!item.permission) return;

        this.allWishlistItems.set(id, item);
      }
    });
  }

  getWishlistItemById(id: string): WishlistItemDto | undefined {
    return this.allWishlistItems.get(id);
  }
}
