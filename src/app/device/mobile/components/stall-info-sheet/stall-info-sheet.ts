import { Component } from '@angular/core';
import {
  IonHeader,
  IonModal,
  IonContent,
  IonList,
  IonAvatar,
  IonLabel,
  IonImg,
  IonItem,
} from '@ionic/angular/standalone';

@Component({
  selector: 'app-stall-info-sheet',
  imports: [IonHeader, IonModal, IonContent, IonList, IonAvatar, IonLabel, IonImg, IonItem],
  templateUrl: './stall-info-sheet.html',
  styleUrl: './stall-info-sheet.scss',
})
export class StallInfoSheet {}
