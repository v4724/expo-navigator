import { CommonModule } from '@angular/common';
import { Component, inject, input, InputSignal } from '@angular/core';
import { StallGroupGridRef } from 'src/app/core/interfaces/locate-stall.interface';
import { StallService } from 'src/app/core/services/state/stall-service';

@Component({
  selector: 'app-stall-group-area',
  imports: [CommonModule],
  templateUrl: './stall-group-area.html',
  styleUrl: './stall-group-area.scss',
})
export class StallGroupArea {
  row: InputSignal<StallGroupGridRef> = input.required();

  private _stallService = inject(StallService);

  stallGroupClicked() {
    const row = this.row();

    let id = `${row.groupId}01`;
    if (row.groupDefaultStallId) {
      id = row.groupDefaultStallId;
    }
    this._stallService.selected = id;
  }
}
