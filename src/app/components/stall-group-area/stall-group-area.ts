import { CommonModule } from '@angular/common';
import { Component, inject, input, InputSignal, OnInit, signal } from '@angular/core';
import { debounceTime } from 'rxjs';
import { StallGridDef } from 'src/app/core/interfaces/stall-def.interface';
import { SelectStallService } from 'src/app/core/services/state/select-stall-service';
import { StallMapService } from 'src/app/core/services/state/stall-map-service';

@Component({
  selector: 'app-stall-group-area',
  imports: [CommonModule],
  templateUrl: './stall-group-area.html',
  styleUrl: './stall-group-area.scss',
})
export class StallGroupArea implements OnInit {
  zone: InputSignal<StallGridDef> = input.required();

  private _selectStallService = inject(SelectStallService);
  private _stallMapService = inject(StallMapService);

  isMatch = signal<boolean>(false);

  ngOnInit() {
    // Update the visible group area elements based on whether any stall in that row matched
    this._stallMapService.matchStallsId$.pipe(debounceTime(100)).subscribe((map) => {
      const isMatch = (map.get(this.zone().zoneId)?.size ?? 0) > 0;
      this.isMatch.set(isMatch);
    });
  }

  stallGroupClicked() {
    const zone = this.zone();

    let id = `${zone.zoneId}01`;
    if (zone.groupDef.defaultStallId) {
      id = zone.groupDef.defaultStallId;
    }
    this._selectStallService.selected = id;
  }
}
