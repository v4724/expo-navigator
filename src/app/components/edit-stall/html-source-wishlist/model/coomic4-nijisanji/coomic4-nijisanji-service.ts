import { Injectable } from '@angular/core';
import { C4NijisanjiAuthor, C4NijisanjiConfig, C4NijisanjiData } from './coomic4-nijisanji';
import { BaseService } from '../base-service';

@Injectable({
  providedIn: 'root',
})
export class Coomic4NijisanjiService extends BaseService<C4NijisanjiAuthor> {
  override headerIdx = 2;
  override htmlDocThKey = '0';

  override processData(rawData: Record<string, string>[], htmlText: string) {
    let currAuthor: C4NijisanjiAuthor;
    let currDay1 = false,
      currDay2 = false,
      currStallId = '';

    console.log('processData', rawData);
    rawData.forEach((rawSeries, rowIdx) => {
      const stallIdDay1 = rawSeries['DAY1'] === 'TRUE' ? true : false;
      const stallIdDay2 = rawSeries['DAY 2'] === 'TRUE' ? true : false;
      const stallId = rawSeries['攤位編號'];
      const authorName = rawSeries['作者'];
      const itemName = rawSeries['商品名稱'];
      const cp = rawSeries['角色／CP'];

      // 任一有值代表是下一筆攤位資料
      if (stallIdDay1 || stallIdDay2) {
        currDay1 = stallIdDay1;
        currDay2 = stallIdDay2;
      }
      // 只有 Day2 或沒有填寫
      if ((!currDay1 && currDay2) || (!currDay1 && !currDay2)) {
        return;
      }
      currStallId = stallId ? stallId : currStallId;

      // 非品項列 (ex: 標題或空白列)
      if (!stallId && !authorName && !itemName) {
        console.warn('wishlist item 缺少資料', stallId, authorName, itemName, 'rowIdx:', rowIdx);
        return;
      }
      if (!!currStallId) {
        this.cacheByStallId.add(currStallId);
      }

      // 當前作者的第一列 (新的一位)
      const key = this.keyForMapping({ stallId: currStallId, authorName } as C4NijisanjiConfig);
      const existAuthor = this.cache.get(key);
      if (authorName && !existAuthor) {
        currAuthor = {
          stallId: currStallId,
          authorName,
          sns: [],
          items: [],
        };
        this.cache.set(key, currAuthor);
      } else if (authorName && existAuthor) {
        currAuthor = existAuthor;
      }
      if (!currAuthor) return;

      const thId = `${this.htmlDocThKey}R${rowIdx}`;
      const snsTitle = rawSeries['作者'];
      if (snsTitle) {
        const sns = this.getLink(snsTitle, thId, 1, 15);
        currAuthor.sns.push(sns);
      }

      if (!itemName && !cp) {
        return;
      }

      const category = rawSeries['商品類型'];
      const newProduct = rawSeries['販售屬性'];
      const rated18 = rawSeries['年齡限制'];
      const price = rawSeries['價格'];
      const promotionalTitle = rawSeries['宣傳連結'];
      const note = rawSeries['其他資訊／備註'];

      let promotional = { title: promotionalTitle, href: '' };
      if (promotionalTitle) {
        promotional = this.getLink(promotionalTitle, thId, 1, 15);
      }

      const item: C4NijisanjiData = {
        cp,
        category,
        itemName,
        rated18: rated18 === 'R18' ? true : false,
        price,
        newProduct: newProduct === '新刊' || newProduct === '新品' ? true : false,
        promotional,
        note,
        freeCategory: newProduct === '無料' ? true : false,
      };

      currAuthor.items.push(item);
    });
  }
}
