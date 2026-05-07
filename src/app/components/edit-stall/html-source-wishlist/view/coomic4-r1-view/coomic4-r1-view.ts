import { Component, inject, input, InputSignal, signal, WritableSignal } from '@angular/core';
import { C4R1Config, loadData } from '../../model/coomic4-r1';
import { finalize } from 'rxjs';
import { WishlistService } from 'src/app/core/services/state/wishlist-service';
import { Skeleton } from 'primeng/skeleton';

@Component({
  selector: 'app-coomic4-r1-view',
  imports: [Skeleton],
  templateUrl: './coomic4-r1-view.html',
  styleUrl: './coomic4-r1-view.scss',
})
export class Coomic4R1View {
  wishlistId: InputSignal<string> = input.required();
  wishlistConfigJson: InputSignal<string> = input.required();
  data?: C4R1Config;
  items: any[] = [];

  isLoading: WritableSignal<boolean> = signal(false);

  private _wishlistService = inject(WishlistService);

  get stallId() {
    return this.data?.stallId || '';
  }
  get authorName() {
    return this.data?.authorName || '';
  }

  constructor() {}

  ngOnInit() {
    this.loadData();
  }

  loadData() {
    this.data = JSON.parse(this.wishlistConfigJson()) as C4R1Config;

    if (this.wishlistId() && this.wishlistConfigJson()) {
      this.isLoading.set(true);
      const csvUrl = this._wishlistService.getWishlistItemById(this.wishlistId())?.data ?? '';

      loadData(csvUrl, this.data)
        .pipe(finalize(() => this.isLoading.set(false)))
        .subscribe((res) => {
          this.items = res;
        });
    }
  }
}
