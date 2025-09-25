import { CommonModule } from '@angular/common';
import { Component, inject, input, InputSignal, OnInit, signal } from '@angular/core';
import { debounceTime } from 'rxjs';
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

  isMatch = signal<boolean>(false);

  ngOnInit() {
    // Update the visible group area elements based on whether any stall in that row matched
    this._stallMapService.matchStallsId$.pipe(debounceTime(100)).subscribe((map) => {
      const isMatch = (map.get(this.row().groupId)?.size ?? 0) > 0;
      this.isMatch.set(isMatch);
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
