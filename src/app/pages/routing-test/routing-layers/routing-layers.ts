import { Component, inject } from '@angular/core';
import { RoutingLayer } from '../routing-layer/routing-layer';
import { toSignal } from '@angular/core/rxjs-interop';
import { MarkedStallService } from 'src/app/core/services/state/marked-stall-service';
import { StallMapService } from 'src/app/core/services/state/stall-map-service';
import { StallService } from 'src/app/core/services/state/stall-service';

@Component({
  selector: 'app-routing-layers',
  imports: [RoutingLayer],
  templateUrl: './routing-layers.html',
  styleUrl: './routing-layers.scss',
})
export class RoutingLayers {
  private _markedStallService = inject(MarkedStallService);
  protected _stallMapService = inject(StallMapService);
  protected _stallService = inject(StallService);

  bookmarkList = toSignal(this._markedStallService.markedList$, { initialValue: [] });

  ngOnInit() {}
}
