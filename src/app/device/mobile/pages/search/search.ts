import { CommonModule } from '@angular/common';
import { AfterViewInit, Component, computed, inject, signal, ViewChild } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { MatIconModule } from '@angular/material/icon';
import { IonSearchbar, IonContent } from '@ionic/angular/standalone';
import { TooltipModule } from 'primeng/tooltip';
import { AdvancedSeriesTag } from 'src/app/components/search-and-filter/advanced-series-tag/advanced-series-tag';
import { AdvancedSeriesTagService } from 'src/app/components/search-and-filter/advanced-series-tag/advanced-series-tag-service';
import { StallSeries, AdvancedFilters } from 'src/app/core/interfaces/stall-series-tag.interface';
import { ExpoStateService } from 'src/app/core/services/state/expo-state-service';
import { SearchAndFilterService } from 'src/app/core/services/state/search-and-filter-service';
import { TagService } from 'src/app/core/services/state/tag-service';

@Component({
  selector: 'app-search',
  imports: [
    CommonModule,
    IonSearchbar,
    IonContent,
    MatIconModule,
    AdvancedSeriesTag,
    TooltipModule,
  ],
  templateUrl: './search.html',
  styleUrl: './search.scss',
})
export class Search implements AfterViewInit {
  @ViewChild('searchbar') searchbar!: IonSearchbar;

  private _tagService = inject(TagService);
  private _searchAndFilterService = inject(SearchAndFilterService);
  private _advancedSTService = inject(AdvancedSeriesTagService);
  private _expoStateService = inject(ExpoStateService);

  // 場次設定
  multiSeries = toSignal(this._expoStateService.multiSeriesExpo$);
  specifiedSeriesId = toSignal(this._expoStateService.specifiedSeriesId$);

  currSearchTerm = toSignal(this._searchAndFilterService.inputSearch$);
  isAdvancedFilterModalOpen = signal(false);
  currentAdvancedFilterSeries = signal<StallSeries | null>(null);

  // 作品 + 標籤
  tagFetchEnd = toSignal(this._tagService.fetchEnd$);
  allSeries = computed(() => {
    if (!this.tagFetchEnd()) return [];
    const data: StallSeries[] = this._searchAndFilterService.seriesData;
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

  ionCancelFlag = false;

  ngAfterViewInit(): void {
    setTimeout(() => {
      this.searchbar?.setFocus().then(() => {
        console.log('searchbar focus set');
      });
    }, 100);
  }

  handleInput(event: Event) {
    if (this.ionCancelFlag) {
      this.ionCancelFlag = false;
      return;
    }

    const target = event.target as HTMLIonSearchbarElement;
    const query = target.value?.toLowerCase() || '';
    this._searchAndFilterService.inputSearch = query;
  }

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

  backToMap() {
    this.ionCancelFlag = true;
    history.back();
  }
}
