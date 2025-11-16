import { Component } from '@angular/core';
import {
  IonHeader,
  IonToolbar,
  IonSearchbar,
  IonContent,
  IonFooter,
  IonButton,
  IonButtons,
} from '@ionic/angular/standalone';

@Component({
  selector: 'app-search',
  imports: [IonSearchbar, IonContent],
  templateUrl: './search.html',
  styleUrl: './search.scss',
})
export class Search {
  backToMap() {
    console.log('back to map');
    history.back();
  }
}
