import { Component, effect, inject, input, InputSignal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { filter, take } from 'rxjs';
import { WishlistService } from 'src/app/core/services/state/wishlist-service';
import { Coomic4UotoService } from '../../model/coomic4-uoto/coomic4-uoto-service';
import { Skeleton } from 'primeng/skeleton';
import { TagModule } from 'primeng/tag';
import { C4UotoConfig, C4UotoAuthor } from '../../model/coomic4-uoto/coomic4-uoto';

@Component({
  selector: 'app-coomic4-uoto-view',
  imports: [Skeleton, TagModule],
  templateUrl: './coomic4-uoto-view.html',
  styleUrl: './coomic4-uoto-view.scss',
})
export class Coomic4UotoView {
  wishlistId: InputSignal<string> = input.required();
  wishlistConfigJson: InputSignal<string> = input.required();
  config?: C4UotoConfig;
  author?: C4UotoAuthor;

  private _wishlistService = inject(WishlistService);
  private _service = inject(Coomic4UotoService);

  isLoading = toSignal(this._service.isLoading$);

  get stallId() {
    return this.config?.stallId || '';
  }
  get authorName() {
    return this.config?.authorName || '';
  }

  constructor() {
    effect(() => {
      this.config = JSON.parse(this.wishlistConfigJson()) as C4UotoConfig;
    });
  }

  ngOnInit() {
    this.config = JSON.parse(this.wishlistConfigJson()) as C4UotoConfig;

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
