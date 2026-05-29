import { Component, effect, inject, input, InputSignal, output } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { Skeleton } from 'primeng/skeleton';
import { TagModule } from 'primeng/tag';
import { filter, take } from 'rxjs';
import { WishlistService } from 'src/app/core/services/state/wishlist-service';
import { C4KoreaConfig, C4KoreaAuthor } from '../../../model/coomic4/coomic4-korea/coomic4-korea';
import { Coomic4KoreaService } from '../../../model/coomic4/coomic4-korea/coomic4-korea-service';
import { WishlistConfig } from '../../../model/base-model';
import { BaseWishlistView } from '../../base-wishlist-view';

@Component({
  selector: 'app-coomic4-korea-view',
  imports: [Skeleton, TagModule],
  templateUrl: './coomic4-korea-view.html',
  styleUrl: './coomic4-korea-view.scss',
})
export class Coomic4KoreaView extends BaseWishlistView<C4KoreaAuthor> {
  wishlistId: InputSignal<string> = input.required();
  wishlistConfigJson: InputSignal<string> = input.required();
  customTagsFromView = output<string>();
  config?: C4KoreaConfig;
  author?: C4KoreaAuthor;

  protected _service = inject(Coomic4KoreaService);

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
      if (item.subject.trim()) {
        set.add(item.subject.trim());
      }
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
