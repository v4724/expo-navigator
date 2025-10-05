import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { SearchAndFilter } from '../search-and-filter/search-and-filter';
import { MarkedLayer } from './marked-layer/marked-layer';
import { OnlyArea } from './only-area/only-area';
import { toSignal } from '@angular/core/rxjs-interop';
import { LayersControllerService } from 'src/app/core/services/state/layers-controller-service';
import { StallsLayer } from './stalls-layer/stalls-layer';
import { UserService } from 'src/app/core/services/state/user-service';

@Component({
  selector: 'app-layers-controller',
  imports: [CommonModule, MarkedLayer, OnlyArea, SearchAndFilter, StallsLayer],
  templateUrl: './layers-controller.html',
  styleUrl: './layers-controller.scss',
})
export class LayersController {
  private _layerControllerService = inject(LayersControllerService);
  private _userService = inject(UserService);

  showControls = toSignal(this._layerControllerService.show$);
  isLogin = toSignal(this._userService.isLogin$);
}
