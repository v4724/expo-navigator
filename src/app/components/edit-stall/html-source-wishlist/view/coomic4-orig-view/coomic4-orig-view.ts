import { Component, effect, inject, input, InputSignal, output } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { Skeleton } from 'primeng/skeleton';
import { TagModule } from 'primeng/tag';
import { WishlistConfig } from '../../model/base-model';
import { C4OrigAuthor, C4OrigConfig } from '../../model/coomic4-orig/coomic4-orig';
import { Coomic4OrigService } from '../../model/coomic4-orig/coomic4-orig-service';
import { BaseWishlistView } from '../base-wishlist-view';

@Component({
  selector: 'app-coomic4-orig-view',
  imports: [Skeleton, TagModule],
  templateUrl: './coomic4-orig-view.html',
  styleUrl: './coomic4-orig-view.scss',
})
export class Coomic4OrigView extends BaseWishlistView<C4OrigAuthor> {
  wishlistId: InputSignal<string> = input.required();
  wishlistConfigJson: InputSignal<string> = input.required();
  customTagsFromView = output<string>();
  config?: C4OrigConfig;
  author?: C4OrigAuthor;

  protected _service = inject(Coomic4OrigService);

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
      if (item.cp.length) {
        item.cp.forEach((cat) => cat.trim() && set.add(cat.trim()));
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
