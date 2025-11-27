import { CommonModule } from '@angular/common';
import { Component, computed, inject, OnInit } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { MatIconModule } from '@angular/material/icon';
import { StallSeries, AdvancedFilters } from 'src/app/core/interfaces/stall-series-tag.interface';
import { TagService } from 'src/app/core/services/state/tag-service';
import { InputSearch } from './input-search/input-search';
import { ResultListBtn } from './result-list-btn/result-list-btn';

import { AdvancedSeriesTagService } from './advanced-series-tag/advanced-series-tag-service';
import { PanelModule } from 'primeng/panel';
import { AdvancedSeriesTag } from './advanced-series-tag/advanced-series-tag';
import { ExpoStateService } from 'src/app/core/services/state/expo-state-service';
import { TooltipModule } from 'primeng/tooltip';

@Component({
  selector: 'app-search-and-filter',
  imports: [
    CommonModule,
    MatIconModule,
    InputSearch,
    ResultListBtn,
    PanelModule,
    AdvancedSeriesTag,
    TooltipModule,
  ],
  templateUrl: './search-and-filter.html',
  styleUrl: './search-and-filter.scss',
})
export class SearchAndFilter implements OnInit {
  private _tagService = inject(TagService);
  private _advancedSTService = inject(AdvancedSeriesTagService);
  private _expoStateService = inject(ExpoStateService);

  // 場次設定
  multiSeries = toSignal(this._expoStateService.multiSeriesExpo$);
  specifiedSeriesId = toSignal(this._expoStateService.specifiedSeriesId$);

  // 作品 + 標籤
  tagFetchEnd = toSignal(this._tagService.fetchEnd$);
  allSeries = computed(() => {
    if (!this.tagFetchEnd()) return [];
    return this._tagService.getSeriesData();
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

  ngOnInit(): void {}

  isSeriesSelected(seriesId: number): boolean {
    return this._tagService.selectedSeriesId.has(seriesId);
  }

  toggleSeries(seriesId: number) {
    this._tagService.toggleSeries(seriesId);
  }

  openAdvancedFilterModal(series: StallSeries) {
    if (!series.groups) return;

    this._advancedSTService.show(series);
  }
}
