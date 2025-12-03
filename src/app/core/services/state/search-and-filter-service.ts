import { inject, Injectable } from '@angular/core';
import { StallService } from './stall-service';
import { BehaviorSubject, combineLatest } from 'rxjs';
import { StallData } from 'src/app/core/interfaces/stall.interface';
import { TagService } from './tag-service';
import { StallGroup, StallSeries, StallTag } from '../../interfaces/stall-series-tag.interface';
import { StallTagDto } from '../../models/stall-series-tag.model';

@Injectable({
  providedIn: 'root',
})
export class SearchAndFilterService {
  private _inputSearch = new BehaviorSubject<string | null>(null);
  private _filterStalls = new BehaviorSubject<StallData[]>([]);
  private _isFiltering = new BehaviorSubject<boolean>(false);
  private _hasFilter = new BehaviorSubject<boolean>(false);

  inputSearch$ = this._inputSearch.asObservable();
  filterStalls$ = this._filterStalls.asObservable();
  isFiltering$ = this._isFiltering.asObservable();
  hasFilter$ = this._hasFilter.asObservable();

  private _tagService = inject(TagService);
  private _stallService = inject(StallService);

  // keep 搜尋條件勾選結果
  private _seriesData: StallSeries[] = [];

  set inputSearch(input: string) {
    this._inputSearch.next(input);
  }

  private set filterStalls(data: StallData[]) {
    this._filterStalls.next(data);
  }

  get seriesData() {
    return this._seriesData;
  }

  constructor() {
    this._tagService.fetchEnd$.pipe().subscribe(() => {
      this._seriesData = this._getSeriesData();
    });

    // 搜尋條件變更
    combineLatest([
      this.inputSearch$,
      this._tagService.selectedSeriesId$,
      this._tagService.selectedAdvancedTagsId$,
    ])
      .pipe()
      .subscribe(([searchTerm, seriesIds, advancedFilter]) => {
        const allStalls = this._stallService.allStalls;
        const filter = allStalls.filter((stall) => {
          if (!!searchTerm) {
            const term = searchTerm.trim().toLocaleLowerCase();
            const isIdMatch = stall.id.toLowerCase().includes(term);
            const isTitleMatch = stall.stallTitle.toLowerCase().includes(term);
            const isPromoTitleMatch = stall.promoData.some((promo) =>
              promo.promoTitle.toLocaleLowerCase().includes(term),
            );
            const isCustomTagMatch = stall.filterCustomTags.some((data) => {
              return data.toLocaleLowerCase().includes(term);
            });

            if (isIdMatch || isTitleMatch || isPromoTitleMatch || isCustomTagMatch) {
              return true;
            }
          }

          const isSeriesMatch = stall.filterSeries.some((id) => {
            return seriesIds.has(id);
          });

          const isTagMatch = stall.filterTags.some((id) => {
            return Object.keys(advancedFilter).some((seriesId) => {
              const seriesNumId = Number(seriesId);
              const hasAdvancedFilter = Object.keys(advancedFilter[seriesNumId] ?? []).some(
                (groupId) => {
                  const groupNumId = Number(groupId);
                  return advancedFilter[seriesNumId][groupNumId].has(id);
                },
              );
              return hasAdvancedFilter;
            });
          });

          return isSeriesMatch || isTagMatch;
        });
        console.debug('filter stalls', filter);
        this.filterStalls = filter;

        const hasFilter = Object.keys(advancedFilter).some((seriesId) => {
          const seriesNumId = Number(seriesId);

          const hasAdvancedFilter = Object.keys(advancedFilter[seriesNumId]).some((groupId) => {
            const groupNumId = Number(groupId);
            return advancedFilter[seriesNumId][groupNumId]?.size > 0;
          });
          return hasAdvancedFilter;
        });
        const isFiltering = !!searchTerm || seriesIds.size > 0 || hasFilter;
        this._isFiltering.next(isFiltering);
        this._hasFilter.next(hasFilter);
      });
  }

  private _getSeriesData() {
    const data: StallSeries[] = [];
    this._tagService.allSeries.forEach((val, seriesId) => {
      const groups: StallGroup[] = [];

      Array.from(this._tagService.allGroups.values())
        .filter((group) => group.seriesId === seriesId)
        .forEach((group) => {
          const tags: StallTag[] = Array.from(this._tagService.allTags.values())
            .filter((tag) => tag.groupId === group.groupId)
            .sort((a, b) => {
              return (a.tagSort ?? 1) > (b.tagSort ?? 1) ? 1 : -1;
            })
            .map((dto: StallTagDto) => {
              return {
                id: dto.tagId,
                name: dto.tagName,
                checked: false,
              };
            });
          groups.push({
            id: group.groupId,
            name: group.groupName,
            tags,
          });
        });

      data.push({
        id: seriesId,
        name: val.seriesName,
        groups,
        checked: false,
      });
    });
    return data;
  }
}
