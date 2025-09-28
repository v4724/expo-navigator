import { Component, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { StallLayerService } from 'src/app/core/services/state/stall-layer-service';

@Component({
  selector: 'app-stalls-layer',
  imports: [],
  templateUrl: './stalls-layer.html',
  styleUrl: './stalls-layer.scss',
})
export class StallsLayer {
  private _stallLayerService = inject(StallLayerService);

  show = toSignal(this._stallLayerService.show$);

  toggleLayer() {
    this._stallLayerService.toggleLayer();
  }
}
