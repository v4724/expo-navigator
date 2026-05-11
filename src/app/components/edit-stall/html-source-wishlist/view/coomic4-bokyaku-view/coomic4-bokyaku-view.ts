import { Component, effect, inject, input, InputSignal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { Skeleton } from 'primeng/skeleton';
import { TagModule } from 'primeng/tag';
import { filter, take } from 'rxjs';
import { WishlistService } from 'src/app/core/services/state/wishlist-service';
import { C4BokyakuConfig, C4BokyakuAuthor } from '../../model/coomic4-bokyaku/coomic4-bokyaku';
import { Coomic4BokyakuService } from '../../model/coomic4-bokyaku/coomic4-bokyaku-service';

@Component({
  selector: 'app-coomic4-bokyaku-view',
  imports: [Skeleton, TagModule],
  templateUrl: './coomic4-bokyaku-view.html',
  styleUrl: './coomic4-bokyaku-view.scss',
})
export class Coomic4BokyakuView {
  wishlistId: InputSignal<string> = input.required();
  wishlistConfigJson: InputSignal<string> = input.required();
  config?: C4BokyakuConfig;
  author?: C4BokyakuAuthor;

  private _wishlistService = inject(WishlistService);
  private _service = inject(Coomic4BokyakuService);

  isLoading = toSignal(this._service.isLoading$);

  get stallId() {
    return this.config?.stallId || '';
  }
  get authorName() {
    return this.config?.authorName || '';
  }

  constructor() {
    effect(() => {
      this.config = JSON.parse(this.wishlistConfigJson()) as C4BokyakuConfig;
    });
  }

  ngOnInit() {
    this.config = JSON.parse(this.wishlistConfigJson()) as C4BokyakuConfig;

    if (!this._service.fetchEnd()) {
      this.loadData();
    }

    this._service.fetchEnd$.pipe(filter((end) => end)).subscribe(() => {
      this.getData();
    });
  }

  getData() {
    if (!this.config) return;
    this.author = this._service.getAuthor(this.config);
  }

  loadData() {
    if (this.wishlistId() && this.wishlistConfigJson()) {
      const csvUrl = this._wishlistService.getWishlistItemById(this.wishlistId())?.data ?? '';
      const htmlUrl = this._wishlistService.getWishlistItemById(this.wishlistId())?.html ?? '';

      this._service.initial(csvUrl, htmlUrl);
      this._service.fetchEnd$
        .pipe(
          filter((end) => end),
          take(1),
        )
        .subscribe(() => {
          this.getData();
        });
    }
  }
}
