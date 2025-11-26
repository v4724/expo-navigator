import { inject, Injectable } from '@angular/core';
import { StallService } from './stall-service';
import { BehaviorSubject, combineLatest } from 'rxjs';
import { StallData } from 'src/app/core/interfaces/stall.interface';
import { TagService } from './tag-service';

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

  set inputSearch(input: string) {
    this._inputSearch.next(input);
  }

  private set filterStalls(data: StallData[]) {
    this._filterStalls.next(data);
  }

  constructor() {
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
}
