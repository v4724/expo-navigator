import { Component, effect, inject, input, InputSignal, output } from '@angular/core';
import { C4R1Author, C4R1Config } from '../../../model/coomic4/coomic4-r1/coomic4-r1';
import { Skeleton } from 'primeng/skeleton';
import { Coomic4R1Service } from '../../../model/coomic4/coomic4-r1/coomic4-r1-service';
import { toSignal } from '@angular/core/rxjs-interop';
import { TagModule } from 'primeng/tag';
import { BaseWishlistView } from '../../base-wishlist-view';
import { WishlistConfig } from '../../../model/base-model';

@Component({
  selector: 'app-coomic4-r1-view',
  imports: [Skeleton, TagModule],
  templateUrl: './coomic4-r1-view.html',
  styleUrl: './coomic4-r1-view.scss',
})
export class Coomic4R1View extends BaseWishlistView<C4R1Author> {
  wishlistId: InputSignal<string> = input.required();
  wishlistConfigJson: InputSignal<string> = input.required();
  customTagsFromView = output<string>();
  author?: C4R1Author;

  protected _service = inject(Coomic4R1Service);

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
