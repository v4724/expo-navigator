import { Component, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import {
  IonModal,
  IonContent,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonButtons,
  IonButton,
  IonIcon,
} from '@ionic/angular/standalone';
import { OnlyArea } from 'src/app/components/layers-controller/only-area/only-area';
import { StallsLayer } from 'src/app/components/layers-controller/stalls-layer/stalls-layer';
import { MarkedStallService } from 'src/app/core/services/state/marked-stall-service';
import { addIcons } from 'ionicons';
import { close } from 'ionicons/icons';

@Component({
  selector: 'app-control-layers-sheet',
  imports: [
    IonModal,
    IonContent,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonButtons,
    IonButton,
    IonIcon,
    StallsLayer,
    OnlyArea,
  ],
  templateUrl: './control-layers-sheet.html',
  styleUrl: './control-layers-sheet.scss',
})
export class ControlLayersSheet {
  private _markedListService = inject(MarkedStallService);

  show = toSignal(this._markedListService.layerShown$);

  constructor() {
    addIcons({ close });
  }

  toggleLayer() {
    this._markedListService.toggleLayer();
  }
}
