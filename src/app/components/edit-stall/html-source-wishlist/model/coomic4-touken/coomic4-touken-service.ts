import { Injectable } from '@angular/core';
import { C4ToukenAuthor, C4ToukenConfig, C4ToukenData } from './coomic4-touken';
import { BaseService } from '../base-service';

@Injectable({
  providedIn: 'root',
})
export class Coomic4ToukenService extends BaseService<C4ToukenAuthor> {
  override headerIdx = 1;
  override htmlDocThKey = '0';
  // override hrefClass = 's12';

  override processData(rawData: Record<string, string>[], htmlText: string) {
    let currAuthor: C4ToukenAuthor;
    let currDay1 = '',
      currDay2 = '';

    console.log('processData', rawData);
    rawData.forEach((rawSeries, rowIdx) => {
      const stallId = rawSeries['攤位號碼(D1)'];
      const day2 = rawSeries['攤位號碼(D2)'];
      const authorName = rawSeries['作者名'];
      const itemName = rawSeries['商品名稱'];

      // 任一有值代表是下一筆攤位資料
      if (stallId || day2) {
        currDay1 = stallId;
        currDay2 = day2;
      }
      // 只有 Day2
      if (!currDay1 && currDay2) {
        // console.log('Skipping row:', rowIdx, rawSeries);
        return;
      }

      // 非品項列 (ex: 標題或空白列)
      if (!stallId && !authorName && !itemName) {
        // console.warn('wishlist item 缺少資料', stallId, authorName, 'rowIdx:', rowIdx, rawSeries);
        return;
      }

      if (!!stallId) {
        this.cacheByStallId.add(stallId);
      }

      // 當前作者的第一列 (新的一位)
      if (authorName) {
        currAuthor = {
          stallId: currDay1,
          authorName,
          sns: [],
          items: [],
        };
        const key = this.keyForMapping({
          stallId: currDay1,
          authorName,
        } as C4ToukenConfig);
        this.cache.set(key, currAuthor);
      }
      if (!currAuthor) return;

      const thId = `${this.htmlDocThKey}R${rowIdx}`;
      const snsTitle = rawSeries['作者名'];
      if (snsTitle) {
        const sns = this.getLink(snsTitle, thId, 1, 6);
        currAuthor.sns.push(sns);
      }

      if (!itemName) return;

      const cp = rawSeries['CP／全員向'];
      const category = rawSeries['類別'];
      const newProduct = rawSeries['新／既'];
      const rated18 = rawSeries['R18'];
      const price = rawSeries['售價'];
      const promotionalTitle = rawSeries['印調/宣傳網址'];
      const note = rawSeries['備註'];

      let promotional = { title: promotionalTitle, href: '' };
      if (promotionalTitle) {
        promotional = this.getLink(promotionalTitle, thId, 1, 15);
      }

      const item: C4ToukenData = {
        cp,
        category,
        itemName,
        rated18: rated18 === 'TRUE' ? true : false,
        price,
        newProduct: newProduct === '新刊/品' ? true : false,
        promotional,
        note,
        day1: currDay1,
        day2: currDay2,
      };

      currAuthor.items.push(item);
    });
  }
}
