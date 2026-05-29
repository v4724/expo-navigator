import { Component, effect, inject, input, InputSignal, output } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { Coomic4UotoService } from '../../../model/coomic4/coomic4-uoto/coomic4-uoto-service';
import { Skeleton } from 'primeng/skeleton';
import { TagModule } from 'primeng/tag';
import { C4UotoAuthor } from '../../../model/coomic4/coomic4-uoto/coomic4-uoto';
import { BaseWishlistView } from '../../base-wishlist-view';
import { WishlistConfig } from '../../../model/base-model';

@Component({
  selector: 'app-coomic4-uoto-view',
  imports: [Skeleton, TagModule],
  templateUrl: './coomic4-uoto-view.html',
  styleUrl: './coomic4-uoto-view.scss',
})
export class Coomic4UotoView extends BaseWishlistView<C4UotoAuthor> {
  wishlistId: InputSignal<string> = input.required();
  wishlistConfigJson: InputSignal<string> = input.required();
  customTagsFromView = output<string>();
  author?: C4UotoAuthor;

  protected _service = inject(Coomic4UotoService);
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
      if (item.originalWork.trim()) {
        set.add(item.originalWork.trim());
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
