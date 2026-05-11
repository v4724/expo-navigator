import { Injectable } from '@angular/core';
import { C4BokyakuAuthor, C4BokyakuConfig, C4BokyakuData } from './coomic4-bokyaku';
import { BaseService } from '../base-service';

@Injectable({
  providedIn: 'root',
})
export class Coomic4BokyakuService extends BaseService<C4BokyakuAuthor> {
  override headerIdx = 1;
  override htmlDocThKey = '0';
  // override hrefClass = 's12';

  override processData(rawData: Record<string, string>[], htmlText: string) {
    let currAuthor: C4BokyakuAuthor;
    let currDay1 = '',
      currDay2 = '';

    console.log('processData', rawData);
    rawData.forEach((rawSeries, rowIdx) => {
      const stallIdDay1 = rawSeries['D1'];
      const stallIdDay2 = rawSeries['D2'];
      const authorName = rawSeries['攤主'];
      const itemName = rawSeries['商品名稱'];

      // 任一有值代表是下一筆攤位資料
      if (stallIdDay1 || stallIdDay2) {
        currDay1 = stallIdDay1;
        currDay2 = stallIdDay2;
      }
      // 只有 Day2
      if (!stallIdDay1 && stallIdDay2) {
        return;
      }
      const stallId = currDay1;

      // 非品項列 (ex: 標題或空白列)
      if (!stallId && !authorName && !itemName) {
        console.warn('wishlist item 缺少資料', stallId, authorName, itemName, 'rowIdx:', rowIdx);
        return;
      }
      if (!!stallId) {
        this.cacheByStallId.add(stallId);
      }

      // 當前作者的第一列 (新的一位)
      if (authorName) {
        currAuthor = {
          stallId,
          authorName,
          sns: [],
          items: [],
        };
        const key = this.keyForMapping({ stallId, authorName } as C4BokyakuConfig);
        this.cache.set(key, currAuthor);
      }
      if (!currAuthor) {
        return;
      }

      const thId = `${this.htmlDocThKey}R${rowIdx}`;
      const snsTitle = rawSeries['作者出沒地'];
      if (snsTitle) {
        const sns = this.getLink(snsTitle, thId, 1, 15);
        currAuthor.sns.push(sns);
      }

      if (!itemName) {
        return;
      }

      const cp = rawSeries['CP'];
      const category = rawSeries['商品類型'];
      const newProduct = rawSeries['新/既品'];
      const price = rawSeries['金額'];
      const promotionalTitle = rawSeries['資訊頁'];
      const note = rawSeries[''];

      let promotional = { title: promotionalTitle, href: '' };
      if (promotionalTitle) {
        promotional = this.getLink(promotionalTitle, thId, 1, 15);
      }
      const rated18 = category === 'R18本';

      const item: C4BokyakuData = {
        cp,
        category,
        itemName,
        rated18,
        price,
        newProduct: newProduct === '新刊' || newProduct === '新品' ? true : false,
        promotional,
        note,
      };

      currAuthor.items.push(item);
    });
  }
}
