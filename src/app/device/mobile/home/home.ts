import { Component, inject } from '@angular/core';
import {
  IonIcon,
  IonToolbar,
  IonSearchbar,
  IonContent,
  IonFooter,
  IonButton,
  IonButtons,
} from '@ionic/angular/standalone';
import { Map } from 'src/app/pages/stalls-map/map/map';
import { MarkedListSheet } from '../components/marked-list-sheet/marked-list-sheet';
import { ControlLayersSheet } from '../components/control-layers-sheet/control-layers-sheet';
import { Router } from '@angular/router';
import { addIcons } from 'ionicons';
import { person } from 'ionicons/icons';
import { UserModal } from '../components/user-modal/user-modal';
import { toSignal } from '@angular/core/rxjs-interop';
import { UserService } from 'src/app/core/services/state/user-service';
import { CommonModule } from '@angular/common';
import { SearchAndFilterService } from 'src/app/core/services/state/search-and-filter-service';
import { StallInfoSheet } from '../components/stall-info-sheet/stall-info-sheet';
import { Button } from 'primeng/button';
import { SearchResultListSheet } from '../components/search-result-list-sheet/search-result-list-sheet';

@Component({
  selector: 'app-home',
  imports: [
    CommonModule,
    IonIcon,
    IonToolbar,
    IonSearchbar,
    IonContent,
    IonFooter,
    Map,
    IonButton,
    IonButtons,
    MarkedListSheet,
    ControlLayersSheet,
    UserModal,
    StallInfoSheet,
    SearchResultListSheet,
    Button,
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
