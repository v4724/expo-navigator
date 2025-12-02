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
import { Button } from 'primeng/button';
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
    Button,
    MarkedListDrawer,
    StallInfoDrawer,
    EditBtn,
    UserDrawer,
    OnlyAreaDrawer,
    SpeedDialModule,
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

  items: MenuItem[] | null;
  constructor() {
    addIcons({ person });

    this.items = [
      { label: '攤位', styleClass: 'legend-default' },
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
}
