import { Injectable } from '@angular/core';
import { C4KimetsuAuthor, C4KimetsuConfig, C4KimetsuData } from './coomic4-kimetsu';
import { BaseService } from '../../base-service';

@Injectable({
  providedIn: 'root',
})
export class Coomic4KimetsuService extends BaseService<C4KimetsuAuthor> {
  override headerIdx = 3;
  override htmlDocThKey = '420670038';

  override processData(rawData: Record<string, string>[], htmlText: string) {
    let currAuthor: C4KimetsuAuthor;

    console.log('processData', rawData);
    rawData.forEach((rawSeries, rowIdx) => {
      const stallId = rawSeries['攤位號碼'];
      const authorName = rawSeries['創作者'];
      const itemName = rawSeries['刊物／品項名稱'];
      const cp = rawSeries['全員／單人／CP／CB（可複選）'];

      // 非品項列 (ex: 標題或空白列)
      if (!stallId && !authorName && !itemName && !cp) {
        // console.warn('wishlist item 缺少資料', stallId, authorName, itemName, 'rowIdx:', rowIdx);
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
        const key = this.keyForMapping({ stallId, authorName } as C4KimetsuConfig);
        this.cache.set(key, currAuthor);
      }
      if (!currAuthor) {
        return;
      }

      const thId = `${this.htmlDocThKey}R${rowIdx}`;
      const snsTitle = rawSeries['作者自介／社團SNS'];
      if (snsTitle) {
        const sns = this.getLink(snsTitle, thId, 1, 15);
        currAuthor.sns.push(sns);
      }

      // 資料上出現只有 CP 沒有商品名稱，可能是作者沒有更新，但其他人有設定該作者 CP 向
      if (!itemName && !cp) return;

      const category = rawSeries['品項類別'];
      const rated18 = rawSeries['一般向／R18向'];
      const price = rawSeries['價格'];
      const promotionalTitle = rawSeries['試閱／工商宣傳直連'];
      const note = rawSeries['備註	'];

      let promotional = { title: promotionalTitle, href: '' };
      if (promotionalTitle) {
        promotional = this.getLink(promotionalTitle, thId, 1, 15);
      }

      const item: C4KimetsuData = {
        cp: cp ? cp.split(',').map((c) => c.trim()) : [],
        category,
        itemName,
        rated18: rated18 === 'R18' ? true : false,
        price,
        newProduct: false, // 目前不使用此欄位
        promotional,
        note,
      };

      currAuthor.items.push(item);
    });
  }
}
