import { Component, effect, inject, input, InputSignal, output } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { C4NucarnivalAuthor } from '../../../model/coomic4/coomic4-nucarnival/coomic4-nucarnival';
import { Coomic4NucarnivalService } from '../../../model/coomic4/coomic4-nucarnival/coomic4-nucarnival-service';
import { Skeleton } from 'primeng/skeleton';
import { TagModule } from 'primeng/tag';
import { WishlistConfig } from '../../../model/base-model';
import { BaseWishlistView } from '../../base-wishlist-view';

@Component({
  selector: 'app-coomic4-nucarnival-view',
  imports: [Skeleton, TagModule],
  templateUrl: './coomic4-nucarnival-view.html',
  styleUrl: './coomic4-nucarnival-view.scss',
})
export class Coomic4NucarnivalView extends BaseWishlistView<C4NucarnivalAuthor> {
  wishlistId: InputSignal<string> = input.required();
  wishlistConfigJson: InputSignal<string> = input.required();
  customTagsFromView = output<string>();
  author?: C4NucarnivalAuthor;

  protected _service = inject(Coomic4NucarnivalService);

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
      if (item.cp) {
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
