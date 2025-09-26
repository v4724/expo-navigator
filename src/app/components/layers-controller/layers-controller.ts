import { CommonModule } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { MatIconModule } from '@angular/material/icon';
import { AreaService } from 'src/app/core/services/state/area-service';
import { SearchAndFilter } from '../search-and-filter/search-and-filter';
import { MarkedLayer } from './marked-layer/marked-layer';

@Component({
  selector: 'app-layers-controller',
  imports: [CommonModule, MatIconModule, SearchAndFilter, MarkedLayer],
  templateUrl: './layers-controller.html',
  styleUrl: './layers-controller.scss',
})
export class LayersController {
  // State Signals
  showControls = signal(true);
  isAreaSectionOpen = signal(true);

  activeAreas = signal<Set<string>>(new Set());

  // Helpers
  private _areaService = inject(AreaService);

  // Data
  // 場內 only
  areaFetchEnd = toSignal(this._areaService.fetchEnd$);
  allAreas = computed(() => {
    if (!this.areaFetchEnd()) return [];

    return this._areaService.allAreas;
  });

  toggleControls() {
    this.showControls.update((v) => !v);
  }

  toggleAreaSection() {
    this.isAreaSectionOpen.update((v) => !v);
  }

  toggleArea(areaId: string) {
    this._areaService.toggleArea(areaId);
  }
}
