import { CommonModule } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { MatIconModule } from '@angular/material/icon';
import { filter, map } from 'rxjs';
import {
  AdvancedFilters,
  StallSeries,
  StallTag,
} from 'src/app/core/interfaces/stall-series-tag.interface';
import { TagService } from 'src/app/core/services/state/tag-service';
interface Area {
  name: string;
  x: number;
  y: number;
  width: number;
  height: number;
  color: string;
}

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

  // Data
  areas = signal<Area[]>([
    { name: '忍亂區', x: 1, y: 1, width: 3, height: 1, color: 'rgba(255, 99, 132, 0.5)' },
    { name: '排球少年區', x: 5, y: 2, width: 3, height: 2, color: 'rgba(54, 162, 235, 0.5)' },
  ]);

  allSeriesAndTags$ = this._tagService.fetchEnd$.pipe(
    filter((val) => !!val),
    map(() => {
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
    }),
  );

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

  selectedAdvancedTags = signal<AdvancedFilters>({});
  selectedAdvancedTagsCount2 = computed(() => {
    const counts: { [category: string]: number } = {};
    const advancedFilters = this.selectedAdvancedTags();
    for (const category in advancedFilters) {
      counts[category] = 0;
      for (const key in advancedFilters[category]) {
        counts[category] += advancedFilters[category][key].size;
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

  toggleArea(areaName: string) {
    this.activeAreas.update((areas) => {
      const newAreas = new Set(areas);
      if (newAreas.has(areaName)) {
        newAreas.delete(areaName);
      } else {
        newAreas.add(areaName);
      }
      return newAreas;
    });
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
