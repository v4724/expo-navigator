import { CommonModule } from '@angular/common';
import { Component, inject, input, InputSignal, OnInit, signal } from '@angular/core';
import { filter, pairwise, startWith } from 'rxjs';
import { StallGroupGridRef } from 'src/app/core/interfaces/stall-group-grid-ref.interface';
import { StallMapService } from 'src/app/core/services/state/stall-map-service';
import { StallService } from 'src/app/core/services/state/stall-service';

@Component({
  selector: 'app-stall-group-area',
  imports: [CommonModule],
  templateUrl: './stall-group-area.html',
  styleUrl: './stall-group-area.scss',
})
export class StallGroupArea implements OnInit {
  row: InputSignal<StallGroupGridRef> = input.required();

  private _stallService = inject(StallService);
  private _stallMapService = inject(StallMapService);

  isSearchMatch = signal<boolean>(false);

  ngOnInit() {
    // Update the visible group area elements based on whether any stall in that row matched
    this._stallMapService.inputSearch$
      .pipe(startWith(null), pairwise())
      .subscribe(([prev, curr]) => {
        if (!curr || prev != curr) {
          this.isSearchMatch.set(false);
        }
      });
    this._stallMapService.inputSearchMatchGroupId$
      .pipe(filter((id) => id === this.row().groupId))
      .subscribe(() => {
        this.isSearchMatch.set(true);
      });
  }

  stallGroupClicked() {
    const row = this.row();

    let id = `${row.groupId}01`;
    if (row.groupDefaultStallId) {
      id = row.groupDefaultStallId;
    }
    this._stallService.selected = id;
  }
}
