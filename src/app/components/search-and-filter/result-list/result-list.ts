import { Component, inject, OnInit } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { Divider } from 'primeng/divider';
import { map } from 'rxjs';
import { StallData } from 'src/app/core/interfaces/stall.interface';
import { LeftSidebarService, SidebarType } from 'src/app/core/services/state/left-sidebar-service';

import { SearchAndFilterService } from 'src/app/core/services/state/search-and-filter-service';
import { SelectStallService } from 'src/app/core/services/state/select-stall-service';
import { SeriesPipe } from '../../../shared/pipe/series-pipe';
import { StallMapService } from 'src/app/core/services/state/stall-map-service';
import { Button } from 'primeng/button';
import { DynamicDialogRef } from 'primeng/dynamicdialog';
import { ExpoStateService } from 'src/app/core/services/state/expo-state-service';
import { TagPipe } from 'src/app/shared/pipe/tag-pipe';
import { StallZoneBadge } from 'src/app/shared/components/stall-info/stall-zone-badge/stall-zone-badge';
import { ResultListService } from './result-list-service';
import { ScrollPanelModule } from 'primeng/scrollpanel';
import { Tooltip } from 'primeng/tooltip';

@Component({
  selector: 'app-result-list',
  imports: [Divider, SeriesPipe, TagPipe, Button, StallZoneBadge, ScrollPanelModule, Tooltip],
  templateUrl: './result-list.html',
  styleUrl: './result-list.scss',
})
export class ResultList implements OnInit {
  private _searchAndFilterService = inject(SearchAndFilterService);
  private _leftSidebarService = inject(LeftSidebarService);
  private _selectStallService = inject(SelectStallService);
  private _stallMapService = inject(StallMapService);
  private _expoStateService = inject(ExpoStateService);
  private _resultListService = inject(ResultListService);
  private readonly _ref = inject(DynamicDialogRef, { optional: true });

  showControls = toSignal(
    this._leftSidebarService.show$.pipe(
      map((layer: SidebarType) => {
        return layer === 'filterResults';
      }),
    ),
  );
  isFiltering = toSignal(this._searchAndFilterService.isFiltering$);
  multiSeriesExpo = toSignal(this._expoStateService.multiSeriesExpo$);

  list = this._resultListService.list;

  ngOnInit(): void {}

  selectAndFocus(stall: StallData) {
    this._selectStallService.selected = stall.id;
    setTimeout(() => {
      this._stallMapService.focusStall(stall.id);
    }, 100);
  }

  clearFilter() {
    this._searchAndFilterService.clearAll();
  }

  toLayerControl() {
    this._leftSidebarService.toggle('layerControl');
  }

  close() {
    this._leftSidebarService.toggle('filterResults');
    this._ref?.close();
  }
}
