import { Component, inject } from '@angular/core';

import { LeftSidebarService } from 'src/app/core/services/state/left-sidebar-service';

@Component({
  selector: 'app-toggle-controller',
  imports: [],
  templateUrl: './toggle-controller.html',
  styleUrl: './toggle-controller.scss',
})
export class ToggleController {
  private _leftSidebarService = inject(LeftSidebarService);

  toggle() {
    this._leftSidebarService.toggle('layerControl');
  }
}
