import { Injectable } from '@angular/core';
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

  private _isLoading = new BehaviorSubject<boolean>(false);
  private _fetchEnd = new BehaviorSubject<boolean>(false);
  isLoading$ = this._isLoading.asObservable();
  fetchEnd$ = this._fetchEnd.asObservable();

  // 依照來源調整
  headerIdx = 1; // google excel title(0 base)
  htmlDocThKey = '0'; // google excel gid
  hrefClass = 's13'; // class for the link cells

  constructor() {}

  fetchEnd() {
    return this._fetchEnd.value;
  }

  initial(url: string, htmlUrl: string) {
    if (!url || !htmlUrl) return;

    if (this.url === url && this.htmlUrl === htmlUrl) {
      return;
    }

    this.url = url;
    this.htmlUrl = htmlUrl;

    this.fetchData().subscribe(() => {
      console.log(this.cache);
    });
  }

  fetchData() {
    // 正在查詢的話不重打 API，防止重複抓取資料
    if (!this._isLoading.value) {
      this._isLoading.next(true);
      return this._fetchData().pipe(
        map(() => true),
        finalize(() => {
          this._isLoading.next(false);
        }),
      );
    }
    return this.fetchEnd$.pipe(
      filter((val) => !!val),
      take(1),
    );
  }

  getAuthor(config: WishlistConfig): T | undefined {
    const key = this.keyForMapping(config);
    return this.cache.get(key);
  }

  protected processData(rawData: Record<string, string>[], htmlText: string) {}

  private _fetchData() {
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
        this._fetchEnd.next(true);
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
