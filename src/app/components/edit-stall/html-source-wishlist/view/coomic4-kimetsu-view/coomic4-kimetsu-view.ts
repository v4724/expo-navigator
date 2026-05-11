import { Component, effect, inject, input, InputSignal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { Skeleton } from 'primeng/skeleton';
import { TagModule } from 'primeng/tag';
import { filter, take } from 'rxjs';
import { WishlistService } from 'src/app/core/services/state/wishlist-service';
import { C4KimetsuConfig, C4KimetsuAuthor } from '../../model/coomic4-kimetsu/coomic4-kimetsu';
import { Coomic4KimetsuService } from '../../model/coomic4-kimetsu/coomic4-kimetsu-service';

@Component({
  selector: 'app-coomic4-kimetsu-view',
  imports: [Skeleton, TagModule],
  templateUrl: './coomic4-kimetsu-view.html',
  styleUrl: './coomic4-kimetsu-view.scss',
})
export class Coomic4KimetsuView {
  wishlistId: InputSignal<string> = input.required();
  wishlistConfigJson: InputSignal<string> = input.required();
  config?: C4KimetsuConfig;
  author?: C4KimetsuAuthor;

  private _wishlistService = inject(WishlistService);
  private _service = inject(Coomic4KimetsuService);

  isLoading = toSignal(this._service.isLoading$);

  get stallId() {
    return this.config?.stallId || '';
  }
  get authorName() {
    return this.config?.authorName || '';
  }

  constructor() {
    effect(() => {
      this.config = JSON.parse(this.wishlistConfigJson()) as C4KimetsuConfig;
    });
  }

  ngOnInit() {
    this.config = JSON.parse(this.wishlistConfigJson()) as C4KimetsuConfig;

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
