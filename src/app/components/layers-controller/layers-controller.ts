import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { SearchAndFilter } from '../search-and-filter/search-and-filter';
import { MarkedLayer } from './marked-layer/marked-layer';
import { OnlyArea } from './only-area/only-area';
import { toSignal } from '@angular/core/rxjs-interop';

import { UserService } from 'src/app/core/services/state/user-service';
import { LeftSidebarService, SidebarType } from 'src/app/core/services/state/left-sidebar-service';
import { map } from 'rxjs';
import { Divider } from 'primeng/divider';
import { ExpoStateService } from 'src/app/core/services/state/expo-state-service';

@Component({
  selector: 'app-layers-controller',
  imports: [CommonModule, MarkedLayer, OnlyArea, SearchAndFilter, Divider],
  templateUrl: './layers-controller.html',
  styleUrl: './layers-controller.scss',
})
export class LayersController {
  private _expoStateService = inject(ExpoStateService);
  private _leftSidebarService = inject(LeftSidebarService);
  private _userService = inject(UserService);

  showControls = toSignal(
    this._leftSidebarService.show$.pipe(
      map((layer: SidebarType) => {
        return layer === 'layerControl';
      }),
    ),
  );
  isLogin = toSignal(this._userService.isLogin$);
  multiSeriesExpo = toSignal(this._expoStateService.multiSeriesExpo$);
}
