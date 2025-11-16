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
  ],
  templateUrl: './home.html',
  styleUrl: './home.scss',
})
export class Home {
  private _userService = inject(UserService);
  private router = inject(Router);

  isLogin = toSignal(this._userService.isLogin$);

  constructor() {
    addIcons({ person });
  }

  toSearch() {
    this.router.navigate(['/mobile-search']);
  }
}
