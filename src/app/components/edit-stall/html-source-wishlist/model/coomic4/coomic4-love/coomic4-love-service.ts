import { Injectable } from '@angular/core';
import { C4LoveAuthor, C4LoveConfig, C4LoveData } from './coomic4-love';
import { BaseService } from '../../base-service';

@Injectable({
  providedIn: 'root',
})
export class Coomic4LoveService extends BaseService<C4LoveAuthor> {
  override headerIdx = 2;
  override htmlDocThKey = '0';

  override processData(rawData: Record<string, string>[], htmlText: string) {
    let currAuthor: C4LoveAuthor;
    let currSns = '',
      currStallId = '';

    console.log('processData', rawData);
    rawData.forEach((rawSeries, rowIdx) => {
      const stallId = rawSeries['攤位號'];
      const authorName = rawSeries['作者'];
      const itemName = rawSeries['品名'];
      const cp = rawSeries['角色'];

      // 任一有值代表是下一筆攤位資料
      currStallId = stallId ? stallId : currStallId;
      currSns = authorName ? authorName : currSns;

      // 非品項列 (ex: 標題或空白列)
      if (!currStallId && !authorName && !itemName) {
        return;
      }
      if (!!currStallId) {
        this.cacheByStallId.add(currStallId);
      }

      // 當前作者的第一列 (新的一位)
      const key = this.keyForMapping({ stallId: currStallId, authorName: currSns } as C4LoveConfig);
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
        const findExist = currAuthor.sns.find((a) => a.title === sns.title && a.href === sns.href);
        !findExist && currAuthor.sns.push(sns);
      }

      if (!itemName && !cp) {
        return;
      }

      const rated18 = rawSeries['分級'];
      const category = rawSeries['類別'];
      const productInfo = rawSeries['規格'];
      const newProduct = rawSeries['新／既品'];
      const price = rawSeries['售價'];
      const promotionalTitle = rawSeries['資訊頁'];
      const note = rawSeries['備註'];

      let promotional = { title: promotionalTitle, href: '' };
      if (promotionalTitle) {
        promotional = this.getLink(promotionalTitle, thId, 1, 15);
      }

      const item: C4LoveData = {
        cp: cp.split(','),
        category,
        productInfo,
        itemName,
        rated18: rated18 === 'R18' ? true : false,
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
