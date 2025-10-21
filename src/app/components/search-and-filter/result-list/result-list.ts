import { Component, inject, OnInit } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { MatDialogRef } from '@angular/material/dialog';
import { Divider } from 'primeng/divider';
import { map } from 'rxjs';
import { StallData } from 'src/app/core/interfaces/stall.interface';
import { LeftSidebarService, SidebarType } from 'src/app/core/services/state/left-sidebar-service';

import { SearchAndFilterService } from 'src/app/core/services/state/search-and-filter-service';
import { SelectStallService } from 'src/app/core/services/state/select-stall-service';
import { SeriesPipe } from '../../../shared/pipe/series-pipe';
import { MatIcon } from '@angular/material/icon';
import { StallMapService } from 'src/app/core/services/state/stall-map-service';

@Component({
  selector: 'app-result-list',
  imports: [Divider, SeriesPipe, MatIcon],
  templateUrl: './result-list.html',
  styleUrl: './result-list.scss',
})
export class ResultList implements OnInit {
  readonly dialogRef = inject(MatDialogRef<ResultList>, { optional: true });
  private _searchAndFilterService = inject(SearchAndFilterService);
  private _leftSidebarService = inject(LeftSidebarService);
  private _selectStallService = inject(SelectStallService);
  private _stallMapService = inject(StallMapService);

  showControls = toSignal(
    this._leftSidebarService.show$.pipe(
      map((layer: SidebarType) => {
        return layer === 'filterResults';
      }),
    ),
  );
  results = toSignal(this._searchAndFilterService.filterStalls$);

  ngOnInit(): void {}

  selectAndFocus(stall: StallData) {
    this._selectStallService.selected = stall.id;
    setTimeout(() => {
      this._stallMapService.focusStall(stall.id);
    }, 100);
  }

  back() {
    this._leftSidebarService.toggle('layerControl');
  }

  close() {
    this.dialogRef?.close();
  }
}
