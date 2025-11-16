import { Component } from '@angular/core';
import {
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonFooter,
  IonTabs,
  IonTab,
  IonTabBar,
  IonTabButton,
  IonIcon,
} from '@ionic/angular/standalone';
import { Map } from 'src/app/pages/stalls-map/map/map';

@Component({
  selector: 'app-home',
  imports: [
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    IonFooter,
    Map,
    IonTabs,
    IonTab,
    IonTabBar,
    IonTabButton,
    IonIcon,
  ],
  templateUrl: './home.html',
  styleUrl: './home.scss',
})
export class Home {}
