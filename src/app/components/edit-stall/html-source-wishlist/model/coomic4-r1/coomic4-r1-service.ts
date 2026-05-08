import { inject, Injectable } from '@angular/core';
import { BehaviorSubject, filter, finalize, forkJoin, from, switchMap, take, tap } from 'rxjs';
import { fetchExcelData } from 'src/app/utils/google-excel-data-loader';
import { C4R1Author, C4R1Config, C4R1Data, Link } from './coomic4-r1';

@Injectable({
  providedIn: 'root',
})
export class Coomic4R1Service {
  cache = new Map<string, C4R1Author>();
  url: string = '';
  htmlUrl: string = '';
  htmlText: string = '';
  htmlDoc?: Document;

  private _isLoading = new BehaviorSubject<boolean>(false);
  private _fetchEnd = new BehaviorSubject<boolean>(false);
  isLoading$ = this._isLoading.asObservable();
  fetchEnd$ = this._fetchEnd.asObservable();

  constructor() {}

  fetchEnd() {
    return this._fetchEnd.value;
  }

  initial(url: string, htmlUrl: string) {
    if (!url || !htmlUrl) return;

    this.url = url;
    this.htmlUrl = htmlUrl;
    console.log('Loading data with url:', url, htmlUrl);

    // 防止重複抓取資料
    if (!this._isLoading.value) {
      this._isLoading.next(true);
      this.fetchData()
        .pipe(
          finalize(() => {
            this._isLoading.next(false);
          }),
        )
        .subscribe(() => {
          console.log(this.cache);
        });
    }
  }

  getAuthor(config: C4R1Config): C4R1Author | undefined {
    const key = this.keyForMapping(config);
    return this.cache.get(key);
  }

  private fetchData() {
    this.cache = new Map<string, C4R1Author>();

    return forkJoin({
      rawData: from(fetchExcelData(this.url, 0)),
      htmlText: from(this.fetchHtmlText(this.htmlUrl)),
    }).pipe(
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

  private processData(rawData: Record<string, string>[], htmlText: string) {
    let currAuthor: C4R1Author;

    rawData.forEach((rawSeries, rowIdx) => {
      const stallId = rawSeries['社團編號'];
      const authorName = rawSeries['作者'];
      const itemName = rawSeries['品項名稱'];

      // 非品項列 (ex: 標題或空白列)
      if (!stallId && !authorName && !itemName) {
        console.warn('wishlist item 缺少資料', stallId, authorName, 'rowIdx:', rowIdx);
        return;
      }

      // 當前作者的第一列 (新的一位)
      if (authorName) {
        currAuthor = {
          stallId,
          authorName,
          sns: [],
          items: [],
        };
        const key = this.keyForMapping({ stallId, authorName } as C4R1Config);
        this.cache.set(key, currAuthor);
      }
      if (!currAuthor) return;

      const thId = `0R${rowIdx}`;
      const snsTitle = rawSeries['作者SNS'];
      if (snsTitle) {
        const sns = this.getLink(snsTitle, thId, 1, 6);
        currAuthor.sns.push(sns);
      }

      if (!itemName) return;

      const onlyEvent = rawSeries['是否參加場內only的集章活動'];
      const rated18 = rawSeries['一般向/R18向'];
      const cp = rawSeries['全員/單人/cp(可複選)'];
      const category = rawSeries['商品類別'];
      const newProduct = rawSeries['新品/既品'];
      const price = rawSeries['價格'];
      const promotionalTitle = rawSeries['宣傳頁面'];
      const note = rawSeries['備註'];
      const onlineSale = rawSeries['是否通販'];

      let promotional = { title: promotionalTitle, href: '' };
      if (promotionalTitle) {
        promotional = this.getLink(promotionalTitle, thId, 7, 15);
      }

      const item: C4R1Data = {
        onlyEvent: onlyEvent === '是' ? true : false,
        itemName,
        rated18: rated18 === 'R18' ? true : false,
        cp: cp.split(','),
        category: category.split(', '),
        newProduct: newProduct === '新品' ? true : false,
        price,
        promotional,
        note,
        onlineSale,
      };

      console.log(item);
      currAuthor.items.push(item);
    });
  }

  getLink(text: string, thId: string, startCellIdx: number, endCellIdx: number): Link {
    // 建立一個暫時的 DOM 解析器
    const th = this.htmlDoc?.getElementById(thId);
    const tr = th ? th.closest('tr') : null;

    if (!tr) {
      console.debug('未找到指定 TR', thId, th);
      return { title: text, href: '' };
    }

    const tds = tr.querySelectorAll('td.s13');
    const link = { title: text, href: '' };
    tds.forEach((td) => {
      const innerText = (td as HTMLTableCellElement).innerText;
      const href = (td.firstChild as HTMLLinkElement)?.href;
      const cellIndex = (td as HTMLTableCellElement)?.cellIndex;
      if (innerText === text && cellIndex >= startCellIdx && cellIndex < endCellIdx) {
        console.debug('找到link', text, thId, cellIndex, startCellIdx, link);
        link.title = innerText;
        link.href = href;
      }
    });

    return link;
  }

  private keyForMapping(config: C4R1Config) {
    return `${config.stallId}-${config.authorName}`;
  }
}
