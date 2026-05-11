import { Component, effect, inject, input, InputSignal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { filter, take } from 'rxjs';
import { WishlistService } from 'src/app/core/services/state/wishlist-service';
import { C4ToukenConfig, C4ToukenAuthor } from '../../model/coomic4-touken/coomic4-touken';
import { Coomic4ToukenService } from '../../model/coomic4-touken/coomic4-touken-service';
import { Skeleton } from 'primeng/skeleton';
import { TagModule } from 'primeng/tag';

@Component({
  selector: 'app-coomic4-touken-view',
  imports: [Skeleton, TagModule],
  templateUrl: './coomic4-touken-view.html',
  styleUrl: './coomic4-touken-view.scss',
})
export class Coomic4ToukenView {
  wishlistId: InputSignal<string> = input.required();
  wishlistConfigJson: InputSignal<string> = input.required();
  config?: C4ToukenConfig;
  author?: C4ToukenAuthor;

  private _wishlistService = inject(WishlistService);
  private _service = inject(Coomic4ToukenService);

  isLoading = toSignal(this._service.isLoading$);

  get stallId() {
    return this.config?.stallId || '';
  }
  get authorName() {
    return this.config?.authorName || '';
  }

  constructor() {
    effect(() => {
      this.config = JSON.parse(this.wishlistConfigJson()) as C4ToukenConfig;
    });
  }

  ngOnInit() {
    this.config = JSON.parse(this.wishlistConfigJson()) as C4ToukenConfig;

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
