import { Component, effect, inject, input, InputSignal, OnInit, output } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { C4ToukenAuthor } from '../../model/coomic4-touken/coomic4-touken';
import { Coomic4ToukenService } from '../../model/coomic4-touken/coomic4-touken-service';
import { Skeleton } from 'primeng/skeleton';
import { TagModule } from 'primeng/tag';
import { BaseWishlistView } from '../base-wishlist-view';
import { WishlistConfig } from '../../model/base-model';

@Component({
  selector: 'app-coomic4-touken-view',
  imports: [Skeleton, TagModule],
  templateUrl: './coomic4-touken-view.html',
  styleUrl: './coomic4-touken-view.scss',
})
export class Coomic4ToukenView extends BaseWishlistView<C4ToukenAuthor> {
  wishlistId: InputSignal<string> = input.required();
  wishlistConfigJson: InputSignal<string> = input.required();
  customTagsFromView = output<string>();
  author?: C4ToukenAuthor;

  protected _service = inject(Coomic4ToukenService);
  isLoading = toSignal(this._service.isLoading$);

  constructor() {
    super();
    effect(() => {
      this._config = JSON.parse(this.wishlistConfigJson()) as WishlistConfig;
      this.initData(this.wishlistConfigJson(), this.wishlistId()).subscribe((valid) => {
        if (!valid) return;

        this._service.fetchEnd$().subscribe(() => {
          this.loadData();
        });
      });
    });
  }

  getData() {
    if (!this._config || !this._config?.authorName) return;
    this.author = this._service.getAuthor(this._config);

    const set = new Set<string>();
    const defaultTag = this.wishlistItem?.tag;
    defaultTag && set.add(defaultTag);
    this.author?.items.forEach((item) => {
      if (item.cp.trim()) {
        set.add(item.cp.trim());
      }
    });
    this.customTagsFromView.emit(Array.from(set).join(', '));
  }

  loadData(force?: boolean) {
    if (this.valid()) {
      this._service.fetchData(force).subscribe(() => {
        this.getData();
      });
    }
  }
}
