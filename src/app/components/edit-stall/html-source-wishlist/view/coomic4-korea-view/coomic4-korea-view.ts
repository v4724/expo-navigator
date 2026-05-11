import { Component, effect, inject, input, InputSignal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { Skeleton } from 'primeng/skeleton';
import { TagModule } from 'primeng/tag';
import { filter } from 'rxjs';
import { WishlistService } from 'src/app/core/services/state/wishlist-service';
import { C4KoreaConfig, C4KoreaAuthor } from '../../model/coomic4-korea/coomic4-korea';
import { Coomic4KoreaService } from '../../model/coomic4-korea/coomic4-korea-service';

@Component({
  selector: 'app-coomic4-korea-view',
  imports: [Skeleton, TagModule],
  templateUrl: './coomic4-korea-view.html',
  styleUrl: './coomic4-korea-view.scss',
})
export class Coomic4KoreaView {
  wishlistId: InputSignal<string> = input.required();
  wishlistConfigJson: InputSignal<string> = input.required();
  config?: C4KoreaConfig;
  author?: C4KoreaAuthor;

  private _wishlistService = inject(WishlistService);
  private _service = inject(Coomic4KoreaService);

  isLoading = toSignal(this._service.isLoading$);

  get stallId() {
    return this.config?.stallId || '';
  }
  get authorName() {
    return this.config?.authorName || '';
  }

  constructor() {
    effect(() => {
      this.config = JSON.parse(this.wishlistConfigJson()) as C4KoreaConfig;
    });
  }

  ngOnInit() {
    this.config = JSON.parse(this.wishlistConfigJson()) as C4KoreaConfig;

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
    }
  }
}
