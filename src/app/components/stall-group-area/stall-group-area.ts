import { CommonModule } from '@angular/common';
import { Component, inject, input, InputSignal } from '@angular/core';
import { StallGroupGridRef } from 'src/app/core/interfaces/locate-stall.interface';

@Component({
  selector: 'app-stall-group-area',
  imports: [CommonModule],
  templateUrl: './stall-group-area.html',
  styleUrl: './stall-group-area.scss',
})
export class StallGroupArea {
  row: InputSignal<StallGroupGridRef> = input.required();
}
