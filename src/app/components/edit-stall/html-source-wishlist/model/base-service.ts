import { inject, Injectable } from '@angular/core';
import {
  BehaviorSubject,
  combineLatest,
  filter,
  finalize,
  from,
  map,
  switchMap,
  take,
  tap,
} from 'rxjs';
import { fetchExcelData } from 'src/app/utils/google-excel-data-loader';
import { WishlistConfig, WishlistLink } from './base-model';
import { ExpoStateService } from 'src/app/core/services/state/expo-state-service';
import { toSignal } from '@angular/core/rxjs-interop';

@Injectable({
  providedIn: 'root',
})
export class BaseService<T> {
  cache = new Map<string, T>();
  cacheByStallId = new Set<string>();

  url: string = ''; // csv data
  htmlUrl: string = ''; // html data
  htmlText: string = '';
  htmlDoc?: Document;

  private _expoStateService = inject(ExpoStateService);
  staleTime = toSignal(this._expoStateService.wishlistStaleTime$, { initialValue: 300000 });
  lastUpdatedTime = -1;

  private _isLoading = new BehaviorSubject<boolean>(false);
  private _fetchEnd = new BehaviorSubject<boolean>(false);
  isLoading$ = this._isLoading.asObservable();
  private _fetchEnd$ = this._fetchEnd.asObservable();

  // 依照來源調整
  headerIdx = 1; // google excel title(0 base)
  htmlDocThKey = '0'; // google excel gid

  constructor() {}

  // 資料完成載入的狀態
  fetchEnd$() {
    return combineLatest([this.isLoading$, this._fetchEnd$]).pipe(
      filter((val) => !val[0] && !!val[1]),
      take(1),
      map(() => true),
    );
  }

  initial(url: string, htmlUrl: string) {
    if (!url || !htmlUrl) return;

    this.url = url;
    this.htmlUrl = htmlUrl;

    this.fetchData().subscribe(() => {
      console.log(this.cache);
    });
  }

  fetchData(force?: boolean) {
    // 沒有人在查詢的話，才查
    // 正在查詢的話不重打 API，防止重複抓取資料
    if (this._isLoading.value) {
      return combineLatest([this.isLoading$, this._fetchEnd$]).pipe(
        filter((val) => !!val[0] && !!val[1]),
        take(1),
        map(() => true),
        tap(() => {
          console.log('fetchData isLoading');
        }),
      );
    }

    // 資料過期
    const currTime = +new Date();
    const diff = currTime - this.lastUpdatedTime;
    if (diff > this.staleTime() || force) {
      return this._fetchData().pipe(
        map(() => true),
        tap(() => {
          console.log('fetchData staleTime');
        }),
      );
    }

    // 不查
    return this._fetchEnd$.pipe(
      filter((val) => !!val),
      take(1),
      tap(() => {
        console.log('fetchData cache');
      }),
    );
  }

  getAuthor(config: WishlistConfig): T | undefined {
    const key = this.keyForMapping(config);
    return this.cache.get(key);
  }

  protected processData(rawData: Record<string, string>[], htmlText: string) {}

  private _fetchData() {
    this._isLoading.next(true);

    this.cache = new Map<string, T>();
    this.cacheByStallId = new Set<string>();
    return combineLatest({
      rawData: from(fetchExcelData(this.url, 0, this.headerIdx)),
      htmlText: from(this.fetchHtmlText(this.htmlUrl)),
    }).pipe(
      take(1),
      tap(({ rawData, htmlText }) => {
        // rawData: Record<string, string>[], htmlText: string
        this.processData(rawData, htmlText);
      }),
      finalize(() => {
        this.lastUpdatedTime = +new Date();
        this._fetchEnd.next(true);
        this._isLoading.next(false);
      }),
    );
  }

  private fetchHtmlText(url: string) {
    return from(fetch(url)).pipe(
      switchMap((res) => {
        return from(res.text());
      }),
      tap((text) => {
        this.htmlText = text;

        const parser = new DOMParser();
        const doc = parser.parseFromString(text, 'text/html');
        this.htmlDoc = doc;
      }),
    );
  }

  getLink(text: string, thId: string, startCellIdx: number, endCellIdx: number): WishlistLink {
    // 建立一個暫時的 DOM 解析器
    const th = this.htmlDoc?.getElementById(thId);
    const tr = th ? th.closest('tr') : null;

    if (!tr) {
      console.debug('未找到指定 TR', thId, th, !!this.htmlDoc);
      return { title: text, href: '' };
    }

    const tds = tr.querySelectorAll(`td:has(a)`);
    const link = { title: text, href: '' };
    tds.forEach((td) => {
      const innerText = (td as HTMLTableCellElement).innerText;
      const href = (td.firstChild as HTMLLinkElement)?.href;
      const cellIndex = (td as HTMLTableCellElement)?.cellIndex;
      if (innerText === text && cellIndex >= startCellIdx && cellIndex < endCellIdx) {
        link.title = innerText;
        link.href = href;
      }
    });

    return link;
  }

  protected keyForMapping(config: WishlistConfig) {
    return `${config.stallId}-${config.authorName}`;
  }
}
