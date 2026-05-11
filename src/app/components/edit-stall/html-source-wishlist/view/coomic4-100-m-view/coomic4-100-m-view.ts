import { Component, effect, inject, input, InputSignal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { filter } from 'rxjs';
import { WishlistService } from 'src/app/core/services/state/wishlist-service';
import { C4100MConfig, C4100MAuthor } from '../../model/coomic4-100-m/coomic4-100-m';
import { Coomic4100MService } from '../../model/coomic4-100-m/coomic4-100-m-service';
import { Skeleton } from 'primeng/skeleton';
import { TagModule } from 'primeng/tag';

@Component({
  selector: 'app-coomic4-100-m-view',
  imports: [Skeleton, TagModule],
  templateUrl: './coomic4-100-m-view.html',
  styleUrl: './coomic4-100-m-view.scss',
})
export class Coomic4100MView {
  wishlistId: InputSignal<string> = input.required();
  wishlistConfigJson: InputSignal<string> = input.required();
  config?: C4100MConfig;
  author?: C4100MAuthor;

  private _wishlistService = inject(WishlistService);
  private _service = inject(Coomic4100MService);

  isLoading = toSignal(this._service.isLoading$);

  get stallId() {
    return this.config?.stallId || '';
  }
  get authorName() {
    return this.config?.authorName || '';
  }

  constructor() {
    effect(() => {
      this.config = JSON.parse(this.wishlistConfigJson()) as C4100MConfig;
    });
  }

  ngOnInit() {
    this.config = JSON.parse(this.wishlistConfigJson()) as C4100MConfig;

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
