import { CommonModule } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { MatIconModule } from '@angular/material/icon';
import { AreaService } from 'src/app/core/services/state/area-service';
import { SearchAndFilter } from '../../search-and-filter/search-and-filter';

@Component({
  selector: 'app-only-area',
  imports: [CommonModule, MatIconModule],
  templateUrl: './only-area.html',
  styleUrl: './only-area.scss',
})
export class OnlyArea {
  // State Signals
  isAreaSectionOpen = signal(false);

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

  show = toSignal(this._areaService.show$);

  toggleAreaSection() {
    this.isAreaSectionOpen.update((v) => !v);
  }

  toggleLayer() {
    this._areaService.toggleLayer();
  }

  toggleArea(areaId: string) {
    this._areaService.toggleArea(areaId);
  }
}
