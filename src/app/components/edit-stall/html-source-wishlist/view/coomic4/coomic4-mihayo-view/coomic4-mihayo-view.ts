import { Component, effect, inject, input, InputSignal, output } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { filter, take } from 'rxjs';
import { WishlistConfig, WishlistAuthor } from '../../../model/base-model';
import { WishlistDefaultService } from '../../../model/default-service';
import { Skeleton } from 'primeng/skeleton';
import { TagModule } from 'primeng/tag';
import { BaseWishlistView } from '../../base-wishlist-view';
import { Coomic4MihayoService } from '../../../model/coomic4/coomic4-hero-mihayo/coomic4-mihayo-service';
import { C4HeroMihayoAuthor } from '../../../model/coomic4/coomic4-hero-mihayo/coomic4-hero-mihayo';

@Component({
  selector: 'app-coomic4-mihayo-view',
  imports: [Skeleton, TagModule],
  templateUrl: './coomic4-mihayo-view.html',
  styles: '',
})
export class Coomic4MihayoView extends BaseWishlistView<C4HeroMihayoAuthor> {
  wishlistId: InputSignal<string> = input.required();
  wishlistConfigJson: InputSignal<string> = input.required();
  customTagsFromView = output<string>();
  author?: C4HeroMihayoAuthor;

  protected _service = inject(Coomic4MihayoService);
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
      if (item.cp?.trim()) {
        set.add(item.cp.trim());
      }
    });
    this.customTagsFromView.emit(Array.from(set).join(', '));
  }
}
