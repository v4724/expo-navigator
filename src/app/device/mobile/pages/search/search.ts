import { CommonModule } from '@angular/common';
import { AfterViewInit, Component, computed, inject, signal, ViewChild } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { MatIconModule } from '@angular/material/icon';
import { IonSearchbar, IonContent, IonList, IonItem, IonLabel } from '@ionic/angular/standalone';
import { AdvancedSeriesTagService } from 'src/app/components/search-and-filter/advanced-series-tag/advanced-series-tag-service';
import {
  StallSeries,
  StallTag,
  AdvancedFilters,
} from 'src/app/core/interfaces/stall-series-tag.interface';
import { SearchAndFilterService } from 'src/app/core/services/state/search-and-filter-service';
import { TagService } from 'src/app/core/services/state/tag-service';

@Component({
  selector: 'app-search',
  imports: [CommonModule, IonSearchbar, IonContent, MatIconModule, IonList, IonItem, IonLabel],
  templateUrl: './search.html',
  styleUrl: './search.scss',
})
export class Search implements AfterViewInit {
  @ViewChild('searchbar') searchbar!: IonSearchbar;

  private _tagService = inject(TagService);
  private _searchAndFilterService = inject(SearchAndFilterService);
  private _advancedSTService = inject(AdvancedSeriesTagService);

  currSearchTerm = toSignal(this._searchAndFilterService.inputSearch$);
  isAdvancedFilterModalOpen = signal(false);
  currentAdvancedFilterSeries = signal<StallSeries | null>(null);

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
    if (!series.advanced) return;

    this._advancedSTService.show(series);
  }

  backToMap() {
    this.ionCancelFlag = true;
    history.back();
  }
}
