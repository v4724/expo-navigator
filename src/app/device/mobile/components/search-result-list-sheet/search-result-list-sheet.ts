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
import { StallZoneBadge } from 'src/app/shared/components/stall-info/stall-zone-badge/stall-zone-badge';
import { ExpoStateService } from 'src/app/core/services/state/expo-state-service';
import { TagPipe } from 'src/app/shared/pipe/tag-pipe';
import { ResultListService } from 'src/app/components/search-and-filter/result-list/result-list-service';

@Component({
  selector: 'app-search-result-list-sheet',
  imports: [
    IonModal,
    IonContent,
    IonIcon,
    IonTitle,
    IonButtons,
    IonButton,
    Divider,
    SeriesPipe,
    StallZoneBadge,
    TagPipe,
  ],
  templateUrl: './search-result-list-sheet.html',
  styleUrl: './search-result-list-sheet.scss',
})
export class SearchResultListSheet {
  @ViewChild('modal') modal!: IonModal;

  private _searchAndFilterService = inject(SearchAndFilterService);
  private _selectStallService = inject(SelectStallService);
  private _stallMapService = inject(StallMapService);
  private _expoStateService = inject(ExpoStateService);
  private _resultListService = inject(ResultListService);

  multiSeriesExpo = toSignal(this._expoStateService.multiSeriesExpo$);
  isFiltering = toSignal(this._searchAndFilterService.isFiltering$);

  list = this._resultListService.list;

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

  close() {
    this.modal.dismiss();
  }
}
