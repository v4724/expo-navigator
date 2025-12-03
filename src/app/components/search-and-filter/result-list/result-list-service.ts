import { computed, inject, Injectable } from '@angular/core';
import { StallService } from '../../../core/services/state/stall-service';
import { StallData } from 'src/app/core/interfaces/stall.interface';
import { TagService } from '../../../core/services/state/tag-service';
import { toSignal } from '@angular/core/rxjs-interop';
import { SearchAndFilterService } from 'src/app/core/services/state/search-and-filter-service';

@Injectable({
  providedIn: 'root',
})
export class ResultListService {
  private _stallService = inject(StallService);
  private _searchAndFilterService = inject(SearchAndFilterService);
  private _tagServcie = inject(TagService);

  allStalls = toSignal(this._stallService.allStalls$);
  filterResults = toSignal(this._searchAndFilterService.filterStalls$);
  isFiltering = toSignal(this._searchAndFilterService.isFiltering$);
  tagFetched = toSignal(this._tagServcie.fetchEnd$);

  list = computed(() => {
    const isTagFetched = this.tagFetched();
    if (!isTagFetched) return [];

    let result: StallData[] = [];
    if (this.isFiltering()) {
      result = this.filterResults() ?? [];
    } else {
      result = this.allStalls() ?? [];
    }
    result.sort((a, b) => {
      if (a.stallZone === '範' && b.stallZone !== '範') {
        return 1;
      } else if (a.stallZone === b.stallZone && a.stallNum > b.stallNum) {
        return 1;
      }
      return -1;
    });
    return Array.from(result);
  });

  constructor() {}
}
