import { Component, inject, signal, WritableSignal } from '@angular/core';
import { StallsMap } from '../pages/stalls-map/stalls-map';
import { Footer } from './footer/footer';
import { Topbar } from '../pages/stalls-map/topbar/topbar';
import { LeftSidebar } from '../components/left-sidebar/left-sidebar';
import { toSignal } from '@angular/core/rxjs-interop';
import { ExpoStateService } from '../core/services/state/expo-state-service';
import { UserService } from '../core/services/state/user-service';
import { MarkedListBtn } from '../shared/components/marked-list/marked-list-btn';
import { ResultListBtn } from '../components/search-and-filter/result-list-btn/result-list-btn';
import { OnlyAreaBtn } from '../components/only-area-btn/only-area-btn';
import { WishlistLayerBtn } from '../components/wishlist-layer-btn/wishlist-layer-btn';
import { filter, map } from 'rxjs';
import { AreaService } from '../core/services/state/area-service';
import { WishlistService } from '../core/services/state/wishlist-service';
import { StallTooltip } from '../pages/stalls-map/layers/components/stall-tooltip/stall-tooltip';

@Component({
  selector: 'app-layout',
  imports: [
    StallsMap,
    Footer,
    Topbar,
    LeftSidebar,
    MarkedListBtn,
    ResultListBtn,
    OnlyAreaBtn,
    WishlistLayerBtn,
    StallTooltip,
  ],
  templateUrl: './layout.html',
  styleUrl: './layout.scss',
})
export class Layout {
  private _userService = inject(UserService);
  private _expoStateService = inject(ExpoStateService);
  private _areaService = inject(AreaService);
  private _wishlistService = inject(WishlistService);

  isLogin = toSignal(this._userService.isLogin$);
  bookmarkSwitch = toSignal(this._expoStateService.bookmarkSwitch$);
  areaCnt = toSignal(
    this._areaService.fetchEnd$.pipe(
      filter((val) => !!val),
      map(() => {
        return this._areaService.cnt;
      }),
    ),
    { initialValue: 0 },
  );
  wishlistCnt = toSignal(
    this._wishlistService.fetchEnd$.pipe(
      filter((val) => !!val),
      map(() => {
        return this._wishlistService.cnt;
      }),
    ),
    { initialValue: 0 },
  );
}
