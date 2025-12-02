import { Component, computed, inject, OnInit } from '@angular/core';
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
import { StallService } from 'src/app/core/services/state/stall-service';
import { ExpoStateService } from 'src/app/core/services/state/expo-state-service';
import { TagPipe } from 'src/app/shared/pipe/tag-pipe';
import { TagService } from 'src/app/core/services/state/tag-service';
import { StallZoneBadge } from 'src/app/shared/components/stall-info/stall-zone-badge/stall-zone-badge';

@Component({
  selector: 'app-result-list',
  imports: [Divider, SeriesPipe, TagPipe, Button, StallZoneBadge],
  templateUrl: './result-list.html',
  styleUrl: './result-list.scss',
})
export class ResultList implements OnInit {
  private _searchAndFilterService = inject(SearchAndFilterService);
  private _stallService = inject(StallService);
  private _leftSidebarService = inject(LeftSidebarService);
  private _selectStallService = inject(SelectStallService);
  private _tagServcie = inject(TagService);
  private _stallMapService = inject(StallMapService);
  private _expoStateService = inject(ExpoStateService);
  private readonly _ref = inject(DynamicDialogRef, { optional: true });

  showControls = toSignal(
    this._leftSidebarService.show$.pipe(
      map((layer: SidebarType) => {
        return layer === 'filterResults';
      }),
    ),
  );
  filterResults = toSignal(this._searchAndFilterService.filterStalls$);
  allStalls = toSignal(this._stallService.allStalls$);
  isFiltering = toSignal(this._searchAndFilterService.isFiltering$);
  multiSeriesExpo = toSignal(this._expoStateService.multiSeriesExpo$);
  tagFetched = toSignal(this._tagServcie.fetchEnd$);

  list = computed(() => {
    const isTagFetched = this.tagFetched();
    if (!isTagFetched) return [];

    let result: StallData[] = [];
    if (this.isFiltering()) {
      result = this.filterResults() ?? [];
    } else {
      result = this.allStalls() ?? [];
    }
    result.sort((a, b) => {
      if (a.stallZone === '範' && b.stallZone !== '範') {
        return 1;
      } else if (a.stallZone === b.stallZone && a.stallNum > b.stallNum) {
        return 1;
      }
      return -1;
    });
    return Array.from(result);
  });

  ngOnInit(): void {}

  selectAndFocus(stall: StallData) {
    this._selectStallService.selected = stall.id;
    setTimeout(() => {
      this._stallMapService.focusStall(stall.id);
    }, 100);
  }

  toLayerControl() {
    this._leftSidebarService.toggle('layerControl');
  }

  close() {
    this._leftSidebarService.toggle('filterResults');
    this._ref?.close();
  }
}
