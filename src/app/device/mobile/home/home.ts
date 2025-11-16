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

@Component({
  selector: 'app-home',
  imports: [
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
  private router = inject(Router);

  constructor() {
    addIcons({ person });
  }

  toSearch() {
    this.router.navigate(['/mobile-search']);
  }
}
