import { Component, input } from '@angular/core';
import { StallData } from 'src/app/core/interfaces/stall.interface';

@Component({
  selector: 'app-stall-zone-badge',
  imports: [],
  templateUrl: './stall-zone-badge.html',
  styleUrl: './stall-zone-badge.scss',
})
export class StallZoneBadge {
  stall = input.required<StallData | undefined>();
}
