import { Component, inject } from '@angular/core';
import { IonSearchbar } from '@ionic/angular/standalone';
import { Map } from 'src/app/pages/stalls-map/map/map';
import { Router } from '@angular/router';
import { addIcons } from 'ionicons';
import { person } from 'ionicons/icons';
import { UserModal } from '../components/user-modal/user-modal';
import { toSignal } from '@angular/core/rxjs-interop';
import { UserService } from 'src/app/core/services/state/user-service';
import { CommonModule } from '@angular/common';
import { SearchAndFilterService } from 'src/app/core/services/state/search-and-filter-service';
import { Button } from 'primeng/button';
import { SearchResultListSheet } from '../components/search-result-list-sheet/search-result-list-sheet';
import { MarkedListDrawer } from '../components/marked-list-drawer/marked-list-drawer';
import { ControlLayersDrawer } from '../components/control-layers-drawer/control-layers-drawer';
import { StallInfoDrawer } from '../components/stall-info-drawer/stall-info-drawer';
import { EditBtn } from 'src/app/components/edit-stall/edit-btn/edit-btn';

@Component({
  selector: 'app-home',
  imports: [
    CommonModule,
    IonSearchbar,
    Map,
    UserModal,
    SearchResultListSheet,
    Button,
    MarkedListDrawer,
    ControlLayersDrawer,
    StallInfoDrawer,
    EditBtn,
  ],
  templateUrl: './home.html',
  styleUrl: './home.scss',
})
export class Home {
  private _userService = inject(UserService);
  private _searchAndFilterService = inject(SearchAndFilterService);
  private router = inject(Router);

  isLogin = toSignal(this._userService.isLogin$);

  // 搜尋
  isFiltering = toSignal(this._searchAndFilterService.isFiltering$);
  currSearchTerm = toSignal(this._searchAndFilterService.inputSearch$);
  results = toSignal(this._searchAndFilterService.filterStalls$);

  constructor() {
    addIcons({ person });
  }

  toSearch() {
    this.router.navigate(['/mobile-search']);
  }
}
