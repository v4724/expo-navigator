import { inject, Injectable } from '@angular/core';
import { C4UotoAuthor, C4UotoConfig, C4UotoData } from './coomic4-uoto';
import { BaseService } from '../base-service';

@Injectable({
  providedIn: 'root',
})
export class Coomic4UotoService extends BaseService<C4UotoAuthor> {
  override headerIdx = 2;
  override hrefClass = 's15';
  override htmlDocThKey = '0';

  override processData(rawData: Record<string, string>[]) {
    let currAuthor: C4UotoAuthor;

    rawData.forEach((rawSeries, rowIdx) => {
      const stallId = rawSeries['攤位號'];
      const authorName = rawSeries['作者'];
      const itemName = rawSeries['品項名稱'];

      // 非品項列 (ex: 標題或空白列)
      if (!stallId && !authorName && !itemName) {
        // console.warn('wishlist item 缺少資料', stallId, authorName, 'rowIdx:', rowIdx);
        return;
      }

      if (!!stallId) {
        this.cacheByStallId.add(stallId);
      }

      // 當前作者的第一列 (新的一位)
      if (authorName && authorName !== currAuthor?.authorName) {
        currAuthor = {
          stallId,
          authorName,
          sns: [],
          items: [],
        };
        const key = this.keyForMapping({ stallId, authorName } as C4UotoConfig);
        this.cache.set(key, currAuthor);
      }
      if (!currAuthor) return;

      const thId = `${this.htmlDocThKey}R${rowIdx}`;
      const snsTitle = rawSeries['作者SNS'];
      if (snsTitle) {
        const sns = this.getLink(snsTitle, thId, 7, 13);
        currAuthor.sns.push(sns);
      }

      if (!itemName) return;

      const category = rawSeries['品項類別'];
      const originalWork = rawSeries['原作'];
      const price = rawSeries['價格'];
      const cp = rawSeries['CP向'];
      const rated18 = rawSeries['是否有R18'];
      const detailTitle = rawSeries['詳細資訊'];
      const promotionalTitle = rawSeries['工商連結'];
      const note = rawSeries['備註'];

      let detail = { title: detailTitle, href: '' };
      if (detailTitle) {
        detail = this.getLink(detailTitle, thId, 3, 14);
      }
      let promotional = { title: promotionalTitle, href: '' };
      if (promotionalTitle) {
        promotional = this.getLink(promotionalTitle, thId, 3, 15);
      }

      const item: C4UotoData = {
        itemName,
        rated18: rated18 === 'R18' ? true : false,
        cp,
        originalWork,
        category,
        price,
        detail,
        promotional,
        note,
      };

      currAuthor.items.push(item);
    });
  }
}
