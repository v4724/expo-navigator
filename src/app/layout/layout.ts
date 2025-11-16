import { Component } from '@angular/core';
import { StallsMap } from '../pages/stalls-map/stalls-map';

@Component({
  selector: 'app-layout',
  imports: [StallsMap],
  templateUrl: './layout.html',
  styleUrl: './layout.scss',
})
export class Layout {}
