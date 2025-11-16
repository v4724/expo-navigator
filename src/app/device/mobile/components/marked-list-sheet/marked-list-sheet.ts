import { Component } from '@angular/core';
import {
  IonModal,
  IonContent,
  IonList,
  IonAvatar,
  IonLabel,
  IonImg,
  IonItem,
} from '@ionic/angular/standalone';

@Component({
  selector: 'app-marked-list-sheet',
  imports: [IonModal, IonContent, IonList, IonAvatar, IonLabel, IonImg, IonItem],
  templateUrl: './marked-list-sheet.html',
  styleUrl: './marked-list-sheet.scss',
})
export class MarkedListSheet {}
