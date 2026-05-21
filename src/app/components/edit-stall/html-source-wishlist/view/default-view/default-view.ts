import { Component, effect, inject, input, InputSignal, output } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { filter, take } from 'rxjs';
import { WishlistConfig, WishlistAuthor } from '../../model/base-model';
import { WishlistDefaultService } from '../../model/default-service';
import { Skeleton } from 'primeng/skeleton';
import { TagModule } from 'primeng/tag';
import { BaseWishlistView } from '../base-wishlist-view';

@Component({
  selector: 'app-default-view',
  imports: [Skeleton, TagModule],
  templateUrl: './default-view.html',
  styleUrl: './default-view.scss',
})
export class DefaultView extends BaseWishlistView<WishlistAuthor> {
  wishlistId: InputSignal<string> = input.required();
  wishlistConfigJson: InputSignal<string> = input.required();
  customTagsFromView = output<string>();
  author?: WishlistAuthor;

  protected _service = inject(WishlistDefaultService);
  isLoading = toSignal(this._service.isLoading$);

  // 拿到 input 設定 > 更新 service 設定 確認設定OK > 確認 service 狀態(?這一步是不是可以跳過) 載入資料
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

  loadData(force?: boolean) {
    if (this.valid()) {
      this._service.fetchData(force).subscribe(() => {
        this.getData();
      });
    }
  }

  getData() {
    if (!this._config || !this._config?.authorName) return;
    this.author = this._service.getAuthor(this._config);

    const set = new Set<string>();
    const defaultTag = this.wishlistItem?.tag;
    defaultTag && set.add(defaultTag);
    this.author?.items.forEach((item) => {
      if (item.subject?.trim()) {
        set.add(item.subject.trim());
      }
      if (Array.isArray(item.cp)) {
        item.cp.forEach((cat) => cat.trim() && set.add(cat.trim()));
      } else if (typeof item.cp === 'string') {
        const cp: string = item.cp ?? '';
        cp && set.add(cp.trim());
      }
    });
    this.customTagsFromView.emit(Array.from(set).join(', '));
  }
}
