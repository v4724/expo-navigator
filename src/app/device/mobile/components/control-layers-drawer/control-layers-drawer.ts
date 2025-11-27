import { CommonModule } from '@angular/common';
import { Component, inject, ViewChild } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { toSignal } from '@angular/core/rxjs-interop';
import { MarkedStallService } from 'src/app/core/services/state/marked-stall-service';
import { OnlyArea } from 'src/app/components/layers-controller/only-area/only-area';
import { StallsLayer } from 'src/app/components/layers-controller/stalls-layer/stalls-layer';
import { DrawerOnMobile } from 'src/app/shared/components/drawer-on-mobile/drawer-on-mobile';
import { ExpoStateService } from 'src/app/core/services/state/expo-state-service';

@Component({
  selector: 'app-control-layers-drawer',
  imports: [CommonModule, ButtonModule, StallsLayer, OnlyArea, DrawerOnMobile],
  templateUrl: './control-layers-drawer.html',
  styleUrl: './control-layers-drawer.scss',
})
export class ControlLayersDrawer {
  @ViewChild(DrawerOnMobile) drawer!: DrawerOnMobile;

  private _markedListService = inject(MarkedStallService);
  private _expoStateService = inject(ExpoStateService);

  showMarkedListLayer = toSignal(this._markedListService.layerShown$);
  multiSeriesExpo = toSignal(this._expoStateService.multiSeriesExpo$);

  toggleLayer() {
    this._markedListService.toggleLayer();
  }

  show() {
    this.drawer.show();
  }

  close() {
    this.drawer.close();
  }
}
