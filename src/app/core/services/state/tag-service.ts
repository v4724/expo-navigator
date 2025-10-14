import { inject, Injectable } from '@angular/core';
import { BehaviorSubject, forkJoin } from 'rxjs';
import { fetchExcelData } from 'src/app/utils/google-excel-data-loader';
import { SERIES_CSV_URL, TAG_CSV_URL } from '../../const/google-excel-csv-url';
import { StallSeriesDto, StallTagDto } from '../../models/stall-series-tag.model';
import { AdvancedFilters, StallTag } from '../../interfaces/stall-series-tag.interface';

@Injectable({
  providedIn: 'root',
})
export class TagService {
  allSeries = new Map<number, StallSeriesDto>();
  allTags = new Map<number, StallTagDto>();

  private _selectedSeriesId = new BehaviorSubject<Set<number>>(new Set());
  private _selectedAdvancedTagsId = new BehaviorSubject<AdvancedFilters>({});

  selectedSeriesId$ = this._selectedSeriesId.asObservable();
  selectedAdvancedTagsId$ = this._selectedAdvancedTagsId.asObservable();

  private _fetchEnd = new BehaviorSubject<boolean>(false);
  fetchEnd$ = this._fetchEnd.asObservable();

  constructor() {
    forkJoin([fetchExcelData(SERIES_CSV_URL), fetchExcelData(TAG_CSV_URL)])
      .pipe()
      .subscribe(([series, tags]) => {
        this.processSeries(series);
        this.processTags(tags);
        this._fetchEnd.next(true);
      });
  }

  get selectedSeriesId() {
    return this._selectedSeriesId.getValue();
  }

  get selectedAdvancedTagsId() {
    return this._selectedAdvancedTagsId.getValue();
  }

  toggleSeries(series: number) {
    const newCats = new Set(this.selectedSeriesId);
    if (newCats.has(series)) {
      newCats.delete(series);
    } else {
      newCats.add(series);
    }
    this._selectedSeriesId.next(newCats);
  }

  toggleAdvancedTag(series: number, key: string, value: number) {
    const newFilters = { ...this.selectedAdvancedTagsId };
    if (!newFilters[series]) newFilters[series] = {};
    if (!newFilters[series][key]) newFilters[series][key] = new Set();

    if (newFilters[series][key].has(value)) {
      newFilters[series][key].delete(value);
    } else {
      newFilters[series][key].add(value);
    }
    this._selectedAdvancedTagsId.next(newFilters);
  }

  clearAdvancedTag(series: number, type: 'cp' | 'char') {
    const newFilters = { ...this.selectedAdvancedTagsId };
    if (newFilters[series]) {
      newFilters[series][type].clear();
    }

    this._selectedAdvancedTagsId.next(newFilters);
  }

  processSeries(rawData: Record<string, string>[]) {
    rawData.forEach((rawSeries) => {
      const id = Number(rawSeries['seriesId']);
      const name = rawSeries['seriesName'];

      if (!id || !name) {
        console.warn('series 缺少設定', id, name);
        return;
      }

      if (!this.allSeries.has(id)) {
        const series: StallSeriesDto = {
          seriesId: Number(id),
          seriesName: name,
        };
        this.allSeries.set(id, series);
      }
    });
  }

  processTags(rawData: Record<string, string>[]) {
    rawData.forEach((rawSeries) => {
      const tagId = Number(rawSeries['tagId']);
      const tagName = rawSeries['tagName'];
      const tagType = rawSeries['tagType'];
      const seriesId = Number(rawSeries['seriesId']);
      const seriesName = rawSeries['seriesName'];

      if (!tagId || !tagName || !tagType || !seriesId) {
        console.warn('tag 缺少設定', tagId, tagName, tagType, seriesId);
        return;
      }

      if (!this.allTags.has(tagId)) {
        const series: StallTagDto = {
          tagId,
          tagName,
          tagType: tagType as 'CHAR' | 'CP',
          seriesId,
          seriesName,
        };
        this.allTags.set(tagId, series);
      }
    });
  }

  toStallTagArr(seriesId: number, tagType: 'CP' | 'CHAR'): StallTag[] {
    return Array.from(this.allTags.values())
      .filter((tag: StallTagDto) => {
        return tag.seriesId === seriesId && tag.tagType === tagType;
      })
      .map((tag: StallTagDto) => {
        return { id: tag.tagId, name: tag.tagName };
      });
  }

  getSeriesById(id: number): StallSeriesDto | undefined {
    return this.allSeries.get(id);
  }

  getTagById(id: number): StallTagDto | undefined {
    return this.allTags.get(id);
  }
}
