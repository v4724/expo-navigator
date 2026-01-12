import { Component, inject, ViewChild } from '@angular/core';
import { IonSearchbar } from '@ionic/angular/standalone';
import { Map } from 'src/app/pages/stalls-map/map/map';
import { Router } from '@angular/router';
import { addIcons } from 'ionicons';
import { person } from 'ionicons/icons';
import { toSignal } from '@angular/core/rxjs-interop';
import { UserService } from 'src/app/core/services/state/user-service';
import { CommonModule } from '@angular/common';
import { SearchAndFilterService } from 'src/app/core/services/state/search-and-filter-service';
import { ButtonModule } from 'primeng/button';
import { SearchResultListSheet } from '../components/search-result-list-sheet/search-result-list-sheet';
import { MarkedListDrawer } from '../components/marked-list-drawer/marked-list-drawer';
import { StallInfoDrawer } from '../components/stall-info-drawer/stall-info-drawer';
import { EditBtn } from 'src/app/components/edit-stall/edit-btn/edit-btn';
import { UserDrawer } from '../components/user-drawer/user-drawer';
import { OnlyAreaDrawer } from '../components/only-area-drawer/only-area-drawer';
import { ExpoStateService } from 'src/app/core/services/state/expo-state-service';
import { SpeedDialModule } from 'primeng/speeddial';
import { MenuItem } from 'primeng/api';
import { ResultList } from 'src/app/components/search-and-filter/result-list/result-list';

@Component({
  selector: 'app-home',
  imports: [
    CommonModule,
    IonSearchbar,
    Map,
    SearchResultListSheet,
    MarkedListDrawer,
    StallInfoDrawer,
    EditBtn,
    UserDrawer,
    OnlyAreaDrawer,
    SpeedDialModule,
    ButtonModule,
  ],
  templateUrl: './home.html',
  styleUrl: './home.scss',
})
export class Home {
  @ViewChild('markedListDrawer') markedListDrawer!: MarkedListDrawer;
  @ViewChild('onlyAreaDrawer') onlyAreaDrawer!: OnlyAreaDrawer;
  @ViewChild('stallInfoDrawer') stallInfoDrawer!: StallInfoDrawer;
  @ViewChild('resultList') resultList!: ResultList;

  private _userService = inject(UserService);
  private _searchAndFilterService = inject(SearchAndFilterService);
  private _expoStateService = inject(ExpoStateService);
  private router = inject(Router);

  isLogin = toSignal(this._userService.isLogin$);

  // 搜尋
  isFiltering = toSignal(this._searchAndFilterService.isFiltering$);
  currSearchTerm = toSignal(this._searchAndFilterService.inputSearch$);
  results = toSignal(this._searchAndFilterService.filterStalls$);

  multiSeriesExpo = toSignal(this._expoStateService.multiSeriesExpo$);
  expoTitle = toSignal(this._expoStateService.expoTitle$);
  expoUrl = toSignal(this._expoStateService.expoUrl$);

  items: MenuItem[] | null;

  // 滑動更新
  touchStartY = 0;
  pullDistance = 0; // 目前下拉的距離 (px)
  threshold = 100; // 觸發更新的門檻 (px)
  isReadyToRefresh = false; // 是否已經拉到位（放開就會更新）

  Math = Math;

  constructor() {
    addIcons({ person });

    this.items = [
      { label: '攤位', styleClass: 'legend-default' },
      { label: '印調', styleClass: 'legend-default legend-print-survey relative ' },
      { label: '宣傳車', styleClass: 'legend-promo' },
      { label: '搜尋結果', styleClass: 'legend-search' },
      { label: '選擇中', styleClass: 'legend-selected' },
    ];
  }

  toSearch() {
    this.markedListDrawer.close();
    this.onlyAreaDrawer.close();
    this.stallInfoDrawer.close();
    this.resultList.close();
    requestAnimationFrame(() => {
      this.router.navigate(['/mobile-search']);
    });
  }

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
