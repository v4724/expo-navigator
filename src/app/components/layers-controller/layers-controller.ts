import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { SearchAndFilter } from '../search-and-filter/search-and-filter';
import { MarkedLayer } from './marked-layer/marked-layer';
import { OnlyArea } from './only-area/only-area';
import { toSignal } from '@angular/core/rxjs-interop';
import { LayersControllerService } from 'src/app/core/services/state/layers-controller-service';
import { StallsLayer } from './stalls-layer/stalls-layer';

@Component({
  selector: 'app-layers-controller',
  imports: [CommonModule, MarkedLayer, OnlyArea, SearchAndFilter, StallsLayer],
  templateUrl: './layers-controller.html',
  styleUrl: './layers-controller.scss',
})
export class LayersController {
  private _layerControllerService = inject(LayersControllerService);

  showControls = toSignal(this._layerControllerService.show$);
}
