import { CommonModule } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { MatIconModule } from '@angular/material/icon';
import {
  StallSeries,
  StallTag,
  AdvancedFilters,
} from 'src/app/core/interfaces/stall-series-tag.interface';
import { TagService } from 'src/app/core/services/state/tag-service';
import { InputSearch } from './input-search/input-search';
import { ResultListBtn } from './result-list-btn/result-list-btn';

import { AdvancedSeriesTagService } from './advanced-series-tag/advanced-series-tag-service';

@Component({
  selector: 'app-search-and-filter',
  imports: [CommonModule, MatIconModule, InputSearch, ResultListBtn],
  templateUrl: './search-and-filter.html',
  styleUrl: './search-and-filter.scss',
})
export class SearchAndFilter {
  private _tagService = inject(TagService);
  private _advancedSTService = inject(AdvancedSeriesTagService);

  isTagSectionOpen = signal(true);

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

  toggleTagSection() {
    this.isTagSectionOpen.update((v) => !v);
  }

  isSeriesSelected(seriesId: number): boolean {
    return this._tagService.selectedSeriesId.has(seriesId);
  }

  toggleSeries(seriesId: number) {
    this._tagService.toggleSeries(seriesId);
  }

  openAdvancedFilterModal(series: StallSeries) {
    if (!series.advanced) return;

    this._advancedSTService.show(series);
  }
}
