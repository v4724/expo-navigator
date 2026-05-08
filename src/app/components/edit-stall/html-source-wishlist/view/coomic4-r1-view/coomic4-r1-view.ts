import { Component, inject, input, InputSignal, signal, WritableSignal } from '@angular/core';
import { C4R1Author, C4R1Config } from '../../model/coomic4-r1/coomic4-r1';
import { filter, finalize } from 'rxjs';
import { WishlistService } from 'src/app/core/services/state/wishlist-service';
import { Skeleton } from 'primeng/skeleton';
import { Coomic4R1Service } from '../../model/coomic4-r1/coomic4-r1-service';
import { toSignal } from '@angular/core/rxjs-interop';
import { TagModule } from 'primeng/tag';

@Component({
  selector: 'app-coomic4-r1-view',
  imports: [Skeleton, TagModule],
  templateUrl: './coomic4-r1-view.html',
  styleUrl: './coomic4-r1-view.scss',
})
export class Coomic4R1View {
  wishlistId: InputSignal<string> = input.required();
  wishlistConfigJson: InputSignal<string> = input.required();
  config?: C4R1Config;
  author?: C4R1Author;

  private _wishlistService = inject(WishlistService);
  private _service = inject(Coomic4R1Service);

  isLoading = toSignal(this._service.isLoading$);

  get stallId() {
    return this.config?.stallId || '';
  }
  get authorName() {
    return this.config?.authorName || '';
  }

  constructor() {}

  ngOnInit() {
    this.config = JSON.parse(this.wishlistConfigJson()) as C4R1Config;

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
