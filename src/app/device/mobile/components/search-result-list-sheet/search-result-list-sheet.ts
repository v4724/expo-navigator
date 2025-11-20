import { Component, inject, ViewChild } from '@angular/core';
import {
  IonModal,
  IonContent,
  IonIcon,
  IonTitle,
  IonButtons,
  IonButton,
} from '@ionic/angular/standalone';
import { toSignal } from '@angular/core/rxjs-interop';
import { SearchAndFilterService } from 'src/app/core/services/state/search-and-filter-service';
import { Divider } from 'primeng/divider';
import { SeriesPipe } from 'src/app/shared/pipe/series-pipe';
import { SelectStallService } from 'src/app/core/services/state/select-stall-service';
import { StallMapService } from 'src/app/core/services/state/stall-map-service';
import { StallData } from 'src/app/core/interfaces/stall.interface';
import { addIcons } from 'ionicons';
import { close } from 'ionicons/icons';

@Component({
  selector: 'app-search-result-list-sheet',
  imports: [IonModal, IonContent, IonIcon, IonTitle, IonButtons, IonButton, Divider, SeriesPipe],
  templateUrl: './search-result-list-sheet.html',
  styleUrl: './search-result-list-sheet.scss',
})
export class SearchResultListSheet {
  @ViewChild('modal') modal!: IonModal;

  private _searchAndFilterService = inject(SearchAndFilterService);
  private _selectStallService = inject(SelectStallService);
  private _stallMapService = inject(StallMapService);

  results = toSignal(this._searchAndFilterService.filterStalls$);

  constructor() {
    addIcons({ close });
  }

  selectAndFocus(stall: StallData) {
    this.modal.setCurrentBreakpoint(0.5);

    this._selectStallService.selected = stall.id;
    setTimeout(() => {
      this._stallMapService.focusStall(stall.id);
    }, 100);
  }

  show() {
    if (this.modal.isOpen) {
      this.modal.dismiss().then(() => {
        this.modal.present().then(() => {
          this.modal.setCurrentBreakpoint(0.75);
        });
      });
    } else {
      this.modal.present().then(() => {
        this.modal.setCurrentBreakpoint(0.75);
      });
    }
  }
}
