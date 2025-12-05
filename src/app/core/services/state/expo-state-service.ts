import { Injectable } from '@angular/core';
import { BehaviorSubject, forkJoin } from 'rxjs';
import { fetchExcelData } from 'src/app/utils/google-excel-data-loader';
import { DEF_CSV_URL } from '../../const/google-excel-csv-url';
import { ExpoDef } from '../../models/expo-def.model';

@Injectable({
  providedIn: 'root',
})
export class ExpoStateService {
  private _expoDef = new Map<string, any>();

  private _fetchEnd = new BehaviorSubject<boolean>(false);
  private _expoTitle = new BehaviorSubject<string>('');
  private _expoUrl = new BehaviorSubject<string>('');
  private _promoGuideUrl = new BehaviorSubject<string>('');
  private _multiSeriesExpo = new BehaviorSubject<boolean>(false);
  private _specifiedSeriesId = new BehaviorSubject<number>(-1);
  private _areaCSVUrl = new BehaviorSubject<string>('');
  private _seriesCSVUrl = new BehaviorSubject<string>('');
  private _groupCSVUrl = new BehaviorSubject<string>('');
  private _tagCSVUrl = new BehaviorSubject<string>('');
  private _stallGridDef = new BehaviorSubject<string>('');
  private _stallZoneDef = new BehaviorSubject<string>('');
  private _desktopMapScaleMax = new BehaviorSubject<number>(-1);
  private _desktopMapScaleFocus = new BehaviorSubject<number>(-1);
  private _mobileMapScaleMax = new BehaviorSubject<number>(-1);
  private _mobileMapScaleFocus = new BehaviorSubject<number>(-1);
  private _mapImageUrl = new BehaviorSubject<string>('');

  fetchEnd$ = this._fetchEnd.asObservable();
  expoTitle$ = this._expoTitle.asObservable();
  expoUrl$ = this._expoUrl.asObservable();
  promoGuideUrl$ = this._promoGuideUrl.asObservable();
  multiSeriesExpo$ = this._multiSeriesExpo.asObservable();
  specifiedSeriesId$ = this._specifiedSeriesId.asObservable();
  areaCSVUrl$ = this._areaCSVUrl.asObservable();
  seriesCSVUrl$ = this._seriesCSVUrl.asObservable();
  groupCSVUrl$ = this._groupCSVUrl.asObservable();
  tagCSVUrl$ = this._tagCSVUrl.asObservable();
  stallGridDef$ = this._stallGridDef.asObservable();
  stallZoneDef$ = this._stallZoneDef.asObservable();
  desktopMapScaleMax$ = this._desktopMapScaleMax.asObservable();
  desktopMapScaleFocus$ = this._desktopMapScaleFocus.asObservable();
  mobileMapScaleMax$ = this._mobileMapScaleMax.asObservable();
  mobileMapScaleFocus$ = this._mobileMapScaleFocus.asObservable();
  mapImageUrl$ = this._mapImageUrl.asObservable();

  constructor() {
    forkJoin([fetchExcelData(DEF_CSV_URL)])
      .pipe()
      .subscribe(([def]) => {
        this.processDef(def);
        this._fetchEnd.next(true);
      });
  }

  processDef(rawData: Record<string, string>[]) {
    rawData.forEach((rawSeries) => {
      const key = rawSeries['key'];
      const value = rawSeries['value'];
      const description = rawSeries['description'];

      if (!key || !value) {
        console.warn('場次定義 缺少設定', key, value, description);
        return;
      }

      if (!this._expoDef.has(key)) {
        const def: ExpoDef = {
          key,
          value,
          description,
        };
        this._expoDef.set(key, def);

        switch (key) {
          case 'EXPO_TITLE':
            this._expoTitle.next(value);
            break;
          case 'EXPO_URL':
            this._expoUrl.next(value);
            break;
          case 'PROMO_GUIDE_URL':
            this._promoGuideUrl.next(value);
            break;
          case 'MULTI_SERIES_EXPO':
            this._multiSeriesExpo.next(value.toLowerCase() === 'false' ? false : true);
            break;
          case 'SPECIFIED_SERIES_ID':
            this._specifiedSeriesId.next(Number(value));
            break;
          case 'AREA_CSV_URL':
            this._areaCSVUrl.next(value);
            break;
          case 'SERIES_CSV_URL':
            this._seriesCSVUrl.next(value);
            break;
          case 'GROUP_CSV_URL':
            this._groupCSVUrl.next(value);
            break;
          case 'TAG_CSV_URL':
            this._tagCSVUrl.next(value);
            break;
          case 'STALL_GRID_DEF':
            this._stallGridDef.next(value);
            break;
          case 'STALL_ZONE_DEF':
            this._stallZoneDef.next(value);
            break;
          case 'DESKTOP_MAP_SCALE_MAX':
            this._desktopMapScaleMax.next(Number(value));
            break;
          case 'DESKTOP_MAP_SCALE_FOCUS':
            this._desktopMapScaleFocus.next(Number(value));
            break;
          case 'MOBILE_MAP_SCALE_MAX':
            this._mobileMapScaleMax.next(Number(value));
            break;
          case 'MOBILE_MAP_SCALE_FOCUS':
            this._mobileMapScaleFocus.next(Number(value));
            break;
          case 'MAP_IMAGE_URL':
            this._mapImageUrl.next(value);
            break;
        }
      }
    });
  }
}
