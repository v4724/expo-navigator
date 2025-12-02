import { Component } from '@angular/core';
import { StallsMap } from '../pages/stalls-map/stalls-map';
import { Footer } from './footer/footer';

@Component({
  selector: 'app-layout',
  imports: [StallsMap, Footer],
  templateUrl: './layout.html',
  styleUrl: './layout.scss',
})
export class Layout {}
