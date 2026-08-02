import { Component, inject, ViewChild } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ExpoStateService } from 'src/app/core/services/state/expo-state-service';
import { UserService } from 'src/app/core/services/state/user-service';
import { MarkedListDrawer } from '../components/marked-list-drawer/marked-list-drawer';
import { CommonModule } from '@angular/common';
import { UserDrawer } from '../components/user-drawer/user-drawer';
import { RoutingMap } from 'src/app/pages/routing-test/routing-map/routing-map';
import { ButtonModule } from 'primeng/button';

@Component({
  selector: 'app-mobile-routing-page',
  imports: [CommonModule, MarkedListDrawer, UserDrawer, RoutingMap, ButtonModule],
  templateUrl: './routing.html',
  styleUrl: './routing.scss',
})
export class Routing {
  @ViewChild('markedListDrawer') markedListDrawer!: MarkedListDrawer;

  private _userService = inject(UserService);
  private _expoStateService = inject(ExpoStateService);

  isLogin = toSignal(this._userService.isLogin$);
  wishlistSwitch = toSignal(this._expoStateService.wishlistSwitch$);
  bookmarkSwitch = toSignal(this._expoStateService.bookmarkSwitch$);
  expoUrl = toSignal(this._expoStateService.expoUrl$);
  expoTitle = toSignal(this._expoStateService.expoTitle$);

  // 滑動更新
  touchStartY = 0;
  pullDistance = 0; // 目前下拉的距離 (px)
  threshold = 100; // 觸發更新的門檻 (px)
  isReadyToRefresh = false; // 是否已經拉到位（放開就會更新）

  Math = Math;
  readonly currYear = new Date().getFullYear();

  constructor() {}

  openUrl() {
    const url = this.expoUrl();
    if (url) {
      window.open(url, '_blank');
    }
  }
  updateTouchStart(e: TouchEvent) {
    this.touchStartY = e.touches[0].pageY;
  }
  updateTouchMove(e: TouchEvent) {
    const currentY = e.touches[0].pageY;
    const distance = currentY - this.touchStartY;

    // 只有當使用者在頂部且向下劃時才計算
    if (window.scrollY === 0 && distance > 0) {
      // 阻尼效果：讓拉動感不會太輕，越往下拉阻力越大
      this.pullDistance = Math.pow(distance, 0.85);

      // 判斷是否超過門檻
      this.isReadyToRefresh = this.pullDistance > this.threshold;
    }
  }
  updateTouchEnd(e: TouchEvent) {
    if (this.isReadyToRefresh) {
      window.location.reload();
    }
    // 重置狀態
    this.pullDistance = 0;
    this.isReadyToRefresh = false;
  }
}
