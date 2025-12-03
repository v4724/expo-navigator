import { inject, Injectable } from '@angular/core';
import { BehaviorSubject, filter, forkJoin, switchMap, take } from 'rxjs';
import { fetchExcelData } from 'src/app/utils/google-excel-data-loader';
import { StallGroupDto, StallSeriesDto, StallTagDto } from '../../models/stall-series-tag.model';
import {
  AdvancedFilters,
  StallGroup,
  StallSeries,
  StallTag,
} from '../../interfaces/stall-series-tag.interface';
import { ExpoStateService } from './expo-state-service';

@Injectable({
  providedIn: 'root',
})
export class TagService {
  expoDef = new Map<string, any>();
  allSeries = new Map<number, StallSeriesDto>();
  allGroups = new Map<number, StallGroupDto>();
  allTags = new Map<number, StallTagDto>();

  private _selectedSeriesId = new BehaviorSubject<Set<number>>(new Set());
  private _selectedAdvancedTagsId = new BehaviorSubject<AdvancedFilters>({});

  selectedSeriesId$ = this._selectedSeriesId.asObservable();
  selectedAdvancedTagsId$ = this._selectedAdvancedTagsId.asObservable();

  private _fetchEnd = new BehaviorSubject<boolean>(false);
  fetchEnd$ = this._fetchEnd.asObservable();

  private _expoStateService = inject(ExpoStateService);

  constructor() {
    forkJoin([
      this._expoStateService.seriesCSVUrl$.pipe(
        filter((val) => !!val),
        take(1),
      ),
      this._expoStateService.groupCSVUrl$.pipe(
        filter((val) => !!val),
        take(1),
      ),
      this._expoStateService.tagCSVUrl$.pipe(
        filter((val) => !!val),
        take(1),
      ),
    ])
      .pipe(
        switchMap(([seriesCSVUrl, groupCSVUrl, tagCSVUrl]) => {
          return forkJoin([
            fetchExcelData(seriesCSVUrl),
            fetchExcelData(groupCSVUrl),
            fetchExcelData(tagCSVUrl),
          ]);
        }),
      )
      .subscribe(([series, groups, tags]) => {
        this.processSeries(series);
        this.processGroups(groups);
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

  toggleAdvancedTag(seriesId: number, groupId: number, tagId: number) {
    const newFilters = { ...this.selectedAdvancedTagsId };
    if (!newFilters[seriesId]) newFilters[seriesId] = {};
    if (!newFilters[seriesId][groupId]) newFilters[seriesId][groupId] = new Set();

    if (newFilters[seriesId][groupId].has(tagId)) {
      newFilters[seriesId][groupId].delete(tagId);
    } else {
      newFilters[seriesId][groupId].add(tagId);
    }
    this._selectedAdvancedTagsId.next(newFilters);
  }

  clearAdvancedTag(seriesId: number, groupId: number) {
    const newFilters = { ...this.selectedAdvancedTagsId };
    if (newFilters[seriesId]) {
      newFilters[seriesId][groupId]?.clear();
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

  processGroups(rawData: Record<string, string>[]) {
    rawData.forEach((rawSeries) => {
      const groupId = Number(rawSeries['groupId']);
      const groupName = rawSeries['groupName'];
      const groupSort = Number(rawSeries['groupSort']);
      const seriesId = rawSeries['seriesId'];
      const seriesName = rawSeries['seriesName'];

      if (!groupId || !groupName) {
        console.warn('group 缺少設定', groupId, groupName);
        return;
      }

      if (!this.allGroups.has(groupId)) {
        const group: StallGroupDto = {
          groupId: Number(groupId),
          groupName,
          groupSort,
          seriesId: Number(seriesId),
          seriesName,
        };
        this.allGroups.set(groupId, group);
      }
    });
  }

  processTags(rawData: Record<string, string>[]) {
    rawData.forEach((rawSeries) => {
      const tagId = Number(rawSeries['tagId']);
      const tagName = rawSeries['tagName'];
      const tagSort = Number(rawSeries['tagSort']);
      const tagType = rawSeries['tagType'];
      const groupId = Number(rawSeries['groupId']);
      const groupName = rawSeries['groupName'];
      const addGroupName = rawSeries['addGroupName'].toLocaleLowerCase() === 'true' ? true : false;

      if (!tagId || !tagName || !tagType || !groupId) {
        console.warn('tag 缺少設定', tagId, tagName, tagType, groupId);
        return;
      }

      if (!this.allTags.has(tagId)) {
        const tag: StallTagDto = {
          tagId,
          tagName,
          tagSort,
          tagType: tagType as 'CHAR',
          groupId,
          groupName,
          addGroupName,
        };
        this.allTags.set(tagId, tag);
      }
    });
  }

  getSeriesById(id: number): StallSeriesDto | undefined {
    return this.allSeries.get(id);
  }

  getGroupById(id: number): StallGroupDto | undefined {
    return this.allGroups.get(id);
  }

  getTagById(id: number): StallTagDto | undefined {
    return this.allTags.get(id);
  }
}
