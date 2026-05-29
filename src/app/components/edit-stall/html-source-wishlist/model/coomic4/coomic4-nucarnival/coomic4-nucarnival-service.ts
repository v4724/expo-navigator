import { Injectable } from '@angular/core';
import { C4NucarnivalConfig, C4NucarnivalAuthor, C4NucarnivalData } from './coomic4-nucarnival';
import { BaseService } from '../../base-service';

@Injectable({
  providedIn: 'root',
})
export class Coomic4NucarnivalService extends BaseService<C4NucarnivalAuthor> {
  override headerIdx = 2;
  override htmlDocThKey = '0';
  // override hrefClass = 's12';

  override processData(rawData: Record<string, string>[], htmlText: string) {
    let currAuthor: C4NucarnivalAuthor;
    let currDay1 = false,
      currDay2 = false,
      currStallId = '';

    console.log('processData', rawData);
    rawData.forEach((rawSeries, rowIdx) => {
      const day1 = rawSeries['DAY1'];
      const day2 = rawSeries['DAY 2'];
      const stallId = rawSeries['攤位編號'];
      const authorName = rawSeries['作者'];
      const itemName = rawSeries['商品名稱'];

      // 任一為 TRUE 代表是下一筆攤位資料
      if (day1 === 'TRUE' || day2 === 'TRUE') {
        currDay1 = day1 === 'TRUE' ? true : false;
        currDay2 = day2 === 'TRUE' ? true : false;
      }
      // 只有 Day2
      if (!currDay1 && currDay2) {
        // console.log('Skipping row:', rowIdx, rawSeries);
        return;
      }

      // 非品項列 (ex: 標題或空白列)
      if (!stallId && !authorName && !itemName) {
        // console.warn('wishlist item 缺少資料', stallId, authorName, 'rowIdx:', rowIdx);
        return;
      }

      if (!!stallId) {
        currStallId = stallId;
        this.cacheByStallId.add(stallId);
      }

      // 當前作者的第一列 (新的一位)
      if (authorName) {
        currAuthor = {
          stallId: currStallId,
          authorName,
          sns: [],
          items: [],
        };
        const key = this.keyForMapping({ stallId: currStallId, authorName } as C4NucarnivalConfig);
        this.cache.set(key, currAuthor);
      }
      if (!currAuthor) return;

      const thId = `${this.htmlDocThKey}R${rowIdx}`;
      const snsTitle = rawSeries['作者'];
      if (snsTitle) {
        const sns = this.getLink(snsTitle, thId, 1, 6);
        currAuthor.sns.push(sns);
      }

      if (!itemName) return;

      const cp = rawSeries['角色／CP'];
      const category = rawSeries['商品類型'];
      const productType = rawSeries['販售屬性'];
      const rated18 = rawSeries['R18'];
      const price = rawSeries['價格'];
      const promotionalTitle = rawSeries['宣傳連結'];
      const note = rawSeries['其他資訊／備註'];

      let promotional = { title: promotionalTitle, href: '' };
      if (promotionalTitle) {
        promotional = this.getLink(promotionalTitle, thId, 1, 15);
      }

      const item: C4NucarnivalData = {
        cp,
        category,
        itemName,
        rated18: rated18 === 'TRUE' ? true : false,
        price,
        productType,
        promotional,
        note,
        day1: currDay1,
        day2: currDay2,
      };

      currAuthor.items.push(item);
    });
  }
}
