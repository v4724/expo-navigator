import { CommonModule } from '@angular/common';
import { Component, signal } from '@angular/core';
import { SearchAndFilter } from '../search-and-filter/search-and-filter';
import { MarkedLayer } from './marked-layer/marked-layer';
import { OnlyArea } from './only-area/only-area';

@Component({
  selector: 'app-layers-controller',
  imports: [CommonModule, MarkedLayer, OnlyArea, SearchAndFilter],
  templateUrl: './layers-controller.html',
  styleUrl: './layers-controller.scss',
})
export class LayersController {
  showControls = signal(true);

  toggleControls() {
    this.showControls.update((v) => !v);
  }
}
