import { Component, computed, inject, OnInit } from '@angular/core';
import { AdvancedSeriesTag } from '../advanced-series-tag/advanced-series-tag';
import { Button } from 'primeng/button';
import { LeftSidebarService, SidebarType } from 'src/app/core/services/state/left-sidebar-service';
import { toSignal } from '@angular/core/rxjs-interop';
import { map } from 'rxjs';
import { AdvancedSeriesTagService } from '../advanced-series-tag/advanced-series-tag-service';
import { ExpoStateService } from 'src/app/core/services/state/expo-state-service';
import { TagService } from 'src/app/core/services/state/tag-service';
import { AdvancedFilters, StallSeries } from 'src/app/core/interfaces/stall-series-tag.interface';
import { CommonModule } from '@angular/common';
import { MatIcon } from '@angular/material/icon';
import { TooltipModule } from 'primeng/tooltip';

@Component({
  selector: 'app-advanced-series-tag-drawer',
  imports: [CommonModule, AdvancedSeriesTag, Button, MatIcon, TooltipModule],
  templateUrl: './advanced-series-tag-drawer.html',
  styleUrl: './advanced-series-tag-drawer.scss',
})
export class AdvancedSeriesTagDrawer implements OnInit {
  private readonly _leftSidebarService = inject(LeftSidebarService);
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

  showControls = toSignal(
    this._leftSidebarService.show$.pipe(
      map((layer: SidebarType) => {
        return layer === 'advancedFilter';
      }),
    ),
  );

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

  close() {
    this._leftSidebarService.toggle('');
  }
}
