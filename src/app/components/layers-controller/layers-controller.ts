import { CommonModule } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { MatIconModule } from '@angular/material/icon';
import { Area } from 'src/app/core/interfaces/area.interface';
import {
  AdvancedFilters,
  StallSeries,
  StallTag,
} from 'src/app/core/interfaces/stall-series-tag.interface';
import { AreaService } from 'src/app/core/services/state/area-service';
import { TagService } from 'src/app/core/services/state/tag-service';

@Component({
  selector: 'app-layers-controller',
  imports: [CommonModule, MatIconModule],
  templateUrl: './layers-controller.html',
  styleUrl: './layers-controller.scss',
})
export class LayersController {
  // State Signals
  showControls = signal(true);
  isAreaSectionOpen = signal(true);
  isTagSectionOpen = signal(true);

  activeAreas = signal<Set<string>>(new Set());
  isAdvancedFilterModalOpen = signal(false);
  currentAdvancedFilterSeries = signal<StallSeries | null>(null);

  // Helpers
  private _tagService = inject(TagService);
  private _areaService = inject(AreaService);

  // Data
  // 場內 only
  areaFetchEnd = toSignal(this._areaService.fetchEnd$);
  allAreas = computed(() => {
    if (!this.areaFetchEnd()) return [];

    return this._areaService.allAreas;
  });

  // 作品 + 標籤
  tagFetchEnd = toSignal(this._tagService.fetchEnd$);
  allSeriesAndTags = computed(() => {
    if (!this.tagFetchEnd()) return [];
    const data: StallSeries[] = [];
    this._tagService.allSeries.forEach((val, key) => {
      const cp: StallTag[] = this._tagService.toStallTagArr(key, 'CP');
      const char: StallTag[] = this._tagService.toStallTagArr(key, 'CHAR');

      data.push({
        id: key,
        name: val.seriesName,
        advanced: {
          cp: cp,
          char: char,
        },
      });
    });
    return data;
  });

  // Computed Signals
  advancedFilterOptions = computed(() => {
    return this.currentAdvancedFilterSeries();
  });

  selectedAdvancedTagsId = toSignal(this._tagService.selectedAdvancedTagsId$, { initialValue: {} });

  selectedAdvancedTagsCount = computed(() => {
    const counts: { [series: string]: number } = {};
    const advancedFilters = this.selectedAdvancedTagsId() as AdvancedFilters;
    for (const series in advancedFilters) {
      counts[series] = 0;
      for (const key in advancedFilters[series]) {
        counts[series] += advancedFilters[series][key].size;
      }
    }
    return counts;
  });

  toggleControls() {
    this.showControls.update((v) => !v);
  }

  toggleAreaSection() {
    this.isAreaSectionOpen.update((v) => !v);
  }

  toggleTagSection() {
    this.isTagSectionOpen.update((v) => !v);
  }

  toggleArea(areaId: string) {
    this._areaService.toggleArea(areaId);
  }

  isSeriesSelected(category: string): boolean {
    return this._tagService.selectedSeriesId.has(category);
  }

  toggleSeries(series: string) {
    this._tagService.toggleSeries(series);
  }

  openAdvancedFilterModal(series: StallSeries) {
    if (!series.advanced) return;
    this.currentAdvancedFilterSeries.set(series);
    this.isAdvancedFilterModalOpen.set(true);
  }

  closeAdvancedFilterModal() {
    this.isAdvancedFilterModalOpen.set(false);
    this.currentAdvancedFilterSeries.set(null);
  }

  isAdvancedTagSelected(series: string, key: string, tagId: string): boolean {
    return this._tagService.selectedAdvancedTagsId[series]?.[key]?.has(tagId) ?? false;
  }

  toggleAdvancedTag(series: string, key: string, value: string) {
    this._tagService.toggleAdvancedTag(series, key, value);
  }
}
