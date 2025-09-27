import { Component, inject } from '@angular/core';
import { LayersControllerService } from 'src/app/core/services/state/layers-controller-service';

@Component({
  selector: 'app-toggle-controller',
  imports: [],
  templateUrl: './toggle-controller.html',
  styleUrl: './toggle-controller.scss',
})
export class ToggleController {
  private _layerControllerService = inject(LayersControllerService);

  toggle() {
    this._layerControllerService.toggle();
  }
}
