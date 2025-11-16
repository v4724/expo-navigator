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
  selector: 'app-control-layers-sheet',
  imports: [IonModal, IonContent, IonList, IonAvatar, IonLabel, IonImg, IonItem],
  templateUrl: './control-layers-sheet.html',
  styleUrl: './control-layers-sheet.scss',
})
export class ControlLayersSheet {}
