import { CommonModule } from '@angular/common';
import { Component, inject, signal, WritableSignal } from '@angular/core';
import { User } from 'src/app/components/user/user';
import { DownloadMap } from 'src/app/components/download-map/download-map';
import { toSignal } from '@angular/core/rxjs-interop';
import { InputSearch } from 'src/app/components/search-and-filter/input-search/input-search';
import { ResultListBtn } from 'src/app/components/search-and-filter/result-list-btn/result-list-btn';
import { UserService } from 'src/app/core/services/state/user-service';
import { MarkedListBtn } from 'src/app/shared/components/marked-list/marked-list-btn';
import { AreaService } from 'src/app/core/services/state/area-service';
import { OnlyAreaBtn } from 'src/app/components/only-area-btn/only-area-btn';
import { WishlistLayerBtn } from 'src/app/components/wishlist-layer-btn/wishlist-layer-btn';
import { WishlistService } from 'src/app/core/services/state/wishlist-service';

@Component({
  selector: 'app-topbar',
  imports: [
    CommonModule,
    User,
    DownloadMap,
    InputSearch,
    ResultListBtn,
    MarkedListBtn,
    OnlyAreaBtn,
    WishlistLayerBtn,
  ],
  templateUrl: './topbar.html',
  styleUrl: './topbar.scss',
})
export class Topbar {
  private _userService = inject(UserService);
  private _areaService = inject(AreaService);
  private _wishlistService = inject(WishlistService);

  isLogin = toSignal(this._userService.isLogin$);
  areaCnt: WritableSignal<number> = signal(0);
  wishlistCnt: WritableSignal<number> = signal(0);

  ngOnInit() {
    this._areaService.fetchEnd$.subscribe(() => {
      this.areaCnt.set(this._areaService.cnt);
    });
    this._wishlistService.fetchEnd$.subscribe(() => {
      this.wishlistCnt.set(this._wishlistService.cnt);
    });
  }
}
