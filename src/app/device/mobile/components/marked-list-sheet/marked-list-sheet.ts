import { Component } from '@angular/core';
import {
  IonModal,
  IonContent,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonButtons,
  IonButton,
} from '@ionic/angular/standalone';
import { CreateMarkedListBtn } from 'src/app/shared/components/marked-list/create-marked-list-btn/create-marked-list-btn';
import { BookmarkList } from 'src/app/shared/components/marked-list/bookmark-list/bookmark-list';

@Component({
  selector: 'app-marked-list-sheet',
  imports: [
    IonModal,
    IonContent,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonButtons,
    IonButton,
    CreateMarkedListBtn,
    BookmarkList,
  ],
  templateUrl: './marked-list-sheet.html',
  styleUrl: './marked-list-sheet.scss',
})
export class MarkedListSheet {}
