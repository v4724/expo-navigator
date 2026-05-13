import { inject } from '@angular/core';
import { WishlistService } from 'src/app/core/services/state/wishlist-service';
import { WishlistAuthor, WishlistConfig } from '../model/base-model';
import { filter, of, take, tap } from 'rxjs';
import { BaseService } from '../model/base-service';

export abstract class BaseWishlistView<T> {
  protected _wishlistService = inject(WishlistService);
  protected abstract _service: BaseService<T>;

  _config?: WishlistConfig;
  _wishlistId?: string;

  get stallId() {
    return this._config?.stallId || '';
  }

  get authorName() {
    return this._config?.authorName || '';
  }

  get wishlistItem() {
    if (!this._wishlistId) return undefined;
    return this._wishlistService.getWishlistItemById(this._wishlistId);
  }

  initData(configJson: string, wishlistId: string) {
    this._config = JSON.parse(configJson) as WishlistConfig;
    this._wishlistId = wishlistId;
    if (wishlistId) {
      return this._wishlistService.fetchEnd$.pipe(
        filter((val) => val),
        take(1),
        tap(() => {
          const wishlistItem = this.wishlistItem;
          const csvUrl = wishlistItem?.data ?? '';
          const htmlUrl = wishlistItem?.html ?? '';
          this._service?.initial(csvUrl, htmlUrl);
        }),
      );
    }
    return of(false);
  }

  valid() {
    return this._config && this._wishlistId;
  }
}
