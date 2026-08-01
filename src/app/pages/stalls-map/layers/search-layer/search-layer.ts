import { Component, ElementRef, inject, OnInit, ViewChild } from '@angular/core';
import { BaseLayer } from '../base-layer';
import { StallData } from 'src/app/core/interfaces/stall.interface';
import { toSignal } from '@angular/core/rxjs-interop';
import { SearchAndFilterService } from 'src/app/core/services/state/search-and-filter-service';
import { TagService } from 'src/app/core/services/state/tag-service';
import { combineLatest, debounceTime, forkJoin } from 'rxjs';

@Component({
  selector: 'app-search-layer',
  imports: [],
  template: `<canvas #stallCanvas class="absolute top-0 left-0 w-full h-full pointer-events-none">
  </canvas>`,
  styleUrl: './search-layer.scss',
})
export class SearchLayer extends BaseLayer implements OnInit {
  @ViewChild('stallCanvas') declare canvasRef: ElementRef<HTMLCanvasElement>;

  private _searchAndFilterService = inject(SearchAndFilterService);
  private _tagService = inject(TagService);

  override stalls = toSignal(this._searchAndFilterService.filterStalls$, { initialValue: [] });

  constructor() {
    super();
  }

  ngOnInit() {
    combineLatest([
      this._selectStallService.selectedStallId$,
      this._searchAndFilterService.inputSearch$,
      this._tagService.selectedSeriesId$,
      this._tagService.selectedAdvancedTagsId$,
      this._searchAndFilterService.filterStalls$,
    ])
      .pipe(debounceTime(16)) // 大約一幀的時間，確保資料都到位了
      .subscribe((res) => {
        if (this._uiStateService.isPlatformBrowser()) {
          requestAnimationFrame(() => this.drawStalls());
        }
      });

    // this._markedListService.markedMapByStallId$.pipe().subscribe(() => {
    //   this.shownList.set(Array.from(this.markedListIdSet()));
    // });
    // this._markedStallService.toggleList$.pipe().subscribe(() => {
    //   this.allMarkedList();
    //   const shownList = Array.from(this.markedListIdSet()).filter((markedListId) => {
    //     const markedList = this.allMarkedList()?.find((list) => list.id === markedListId);
    //     if (markedList) {
    //       return markedList.show;
    //     }
    //     return false;
    //   });
    //   this.shownList.set(shownList);
    // });
  }

  protected override getFillColor(s: StallData): string {
    const isSelected = s.id === this._selectStallService.selected;
    const isMatch = this.isMatch(s);

    // 有順序性
    let color = this.legendColor?.default;
    if (isSelected) {
      color = this.getRGBColor(this.legendColor?.selected);
    }
    // 符合搜尋條件
    if (isMatch) {
      color = this.getRGBColor(this.legendColor?.search);
    }
    this.updateGroupAreaMatch(s, isMatch);
    return color ?? '';
  }

  private updateGroupAreaMatch(s: StallData, isMatch: boolean) {
    // If a match is found, record its row ID.
    const groupId = s.id.substring(0, 1);
    this._stallMapService.updateMatchStallsId(groupId, s.id, isMatch);
  }

  private isSearchMatch(stall: StallData): boolean {
    let isMatch = false;

    const searchTerm = this._searchAndFilterService.inputSearch;
    if (!!searchTerm) {
      const hasPromoTitleMatch = stall.promoData.some((promo) =>
        promo.promoTitle.toLowerCase().includes(searchTerm),
      );
      const hasTagMatch = stall.filterCustomTags.some((tag) =>
        tag.toLowerCase().includes(searchTerm),
      );

      isMatch =
        stall.id.toLowerCase().includes(searchTerm) ||
        stall.stallTitle.toLowerCase().includes(searchTerm) ||
        stall.stallAuthor.toLowerCase().includes(searchTerm) ||
        hasPromoTitleMatch ||
        hasTagMatch;
    }

    return isMatch;
  }

  private isSeriesMatch(s: StallData): boolean {
    const ids = this._tagService.selectedSeriesId;
    const isMatch = s.filterSeries.some((id) => {
      return ids.has(id);
    });
    return isMatch;
  }

  private isTagMatch(s: StallData): boolean {
    const ids = this._tagService.selectedAdvancedTagsId;
    const isMatch = s.filterTags.some((id) => {
      let isMatch = false;
      Object.keys(ids).forEach((seriesId) => {
        const numId = Number(seriesId);
        Object.keys(ids[numId] ?? []).forEach((groupId) => {
          const groupNumId = Number(groupId);
          isMatch = isMatch || ids[numId][groupNumId].has(id);
        });
      });
      return isMatch;
    });
    return isMatch;
  }

  private isMatch(s: StallData) {
    return this.isSearchMatch(s) || this.isSeriesMatch(s) || this.isTagMatch(s);
  }
}
