import { Injectable } from '@angular/core';
import { BehaviorSubject, forkJoin, of } from 'rxjs';
import { fetchExcelData } from 'src/app/utils/google-excel-data-loader';
import { DEF_CSV_URL } from '../../const/google-excel-csv-url';
import { ExpoDef } from '../../models/expo-def.model';

@Injectable({
  providedIn: 'root',
})
export class ExpoStateService {
  private _expoDef = new Map<string, any>();

  private _fetchEnd = new BehaviorSubject<boolean>(false);
  private _multiSeriesExpo = new BehaviorSubject<boolean>(false);
  private _specifiedSeriesId = new BehaviorSubject<number>(-1);
  fetchEnd$ = this._fetchEnd.asObservable();
  multiSeriesExpo$ = this._multiSeriesExpo.asObservable();
  specifiedSeriesId$ = this._specifiedSeriesId.asObservable();

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
          case 'MULTI_SERIES_EXPO':
            this._multiSeriesExpo.next(value.toLowerCase() === 'false' ? false : true);
            break;
          case 'SPECIFIED_SERIES_ID':
            this._specifiedSeriesId.next(Number(value));
            break;
        }
      }
    });
  }
}
