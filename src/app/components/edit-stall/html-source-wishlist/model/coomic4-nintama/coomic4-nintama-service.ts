import { Injectable } from '@angular/core';
import { C4NintamaAuthor, C4NintamaConfig, C4NintamaData } from './coomic4-nintama';
import { BaseService } from '../base-service';

@Injectable({
  providedIn: 'root',
})
export class Coomic4NintamaService extends BaseService<C4NintamaAuthor> {
  override headerIdx = 1;
  override htmlDocThKey = '1460021764';

  override processData(rawData: Record<string, string>[], htmlText: string) {
    let currAuthor: C4NintamaAuthor;
    let currDay = '',
      currStallId = '';

    console.log('processData', rawData);
    rawData.forEach((rawSeries, rowIdx) => {
      const stallId = rawSeries['攤位號'];
      const day = rawSeries['天數'];
      const authorName = rawSeries['作者'];
      const itemName = rawSeries['商品/刊物名'];
      const cp = rawSeries['CP/創作取向'];

      // 任一有值代表是下一筆攤位資料
      if (stallId || day) {
        currStallId = stallId;
        currDay = day;
      }
      // 只有 Day2
      if (!currDay.includes('D1') && !currDay.includes('兩日')) {
        return;
      }

      // 非品項列 (ex: 標題或空白列)
      if (!currStallId && !authorName && !itemName) {
        return;
      }
      if (!!currStallId) {
        this.cacheByStallId.add(currStallId);
      }

      // 當前作者的第一列 (新的一位)
      const key = this.keyForMapping({ stallId: currStallId, authorName } as C4NintamaConfig);
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

      const rated18 = rawSeries['是否為R18'];
      const category = rawSeries['商品類別'];
      const newProduct = rawSeries['新／既品'];
      const price = rawSeries['售價（元）'];
      const promotionalTitle = rawSeries['宣傳網頁'];
      const note = rawSeries['備註'];

      let promotional = { title: promotionalTitle, href: '' };
      if (promotionalTitle) {
        promotional = this.getLink(promotionalTitle, thId, 1, 15);
      }

      const item: C4NintamaData = {
        cp,
        category,
        itemName,
        rated18: rated18 === '是' ? true : false,
        price,
        newProduct: newProduct === '新刊' || newProduct === '新品' ? true : false,
        promotional,
        note,
        freeCategory: newProduct === '無料',
      };

      currAuthor.items.push(item);
    });
  }
}
