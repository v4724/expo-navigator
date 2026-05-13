import { Component, effect, inject, input, InputSignal, output } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { Skeleton } from 'primeng/skeleton';
import { TagModule } from 'primeng/tag';
import { filter, take } from 'rxjs';
import { WishlistService } from 'src/app/core/services/state/wishlist-service';
import { C4BokyakuConfig, C4BokyakuAuthor } from '../../model/coomic4-bokyaku/coomic4-bokyaku';
import { Coomic4BokyakuService } from '../../model/coomic4-bokyaku/coomic4-bokyaku-service';
import { BaseWishlistView } from '../base-wishlist-view';
import { WishlistConfig } from '../../model/base-model';

@Component({
  selector: 'app-coomic4-bokyaku-view',
  imports: [Skeleton, TagModule],
  templateUrl: './coomic4-bokyaku-view.html',
  styleUrl: './coomic4-bokyaku-view.scss',
})
export class Coomic4BokyakuView extends BaseWishlistView<C4BokyakuAuthor> {
  wishlistId: InputSignal<string> = input.required();
  wishlistConfigJson: InputSignal<string> = input.required();
  customTagsFromView = output<string>();
  author?: C4BokyakuAuthor;

  protected _service = inject(Coomic4BokyakuService);

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

  ngOnInit() {}

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
