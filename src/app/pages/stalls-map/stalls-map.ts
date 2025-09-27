import { Component, ElementRef, ViewChild } from '@angular/core';
import { Lightbox } from 'src/app/shared/components/lightbox/lightbox';
import { Tooptip } from 'src/app/shared/components/tooptip/tooptip';
import { CommonModule } from '@angular/common';
import { Topbar } from './topbar/topbar';
import { LayersController } from 'src/app/components/layers-controller/layers-controller';
import { Map } from './map/map';

@Component({
  selector: 'app-stalls-map',
  imports: [Lightbox, Tooptip, CommonModule, Topbar, LayersController, Map],
  templateUrl: './stalls-map.html',
  styleUrl: './stalls-map.scss',
})
export class StallsMap {}
