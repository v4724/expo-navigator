import { Injectable } from '@angular/core';
import { C4R1Author, C4R1Config, C4R1Data } from './coomic4-r1';
import { BaseService } from '../../base-service';

@Injectable({
  providedIn: 'root',
})
export class Coomic4R1Service extends BaseService<C4R1Author> {
  override htmlDocThKey = '2067136178';

  override processData(rawData: Record<string, string>[], htmlText: string) {
    let currAuthor: C4R1Author,
      currStallId = '',
      currOnlyEvent = false,
      currNewProduct = false;

    rawData.forEach((rawSeries, rowIdx) => {
      const stallId = rawSeries['社團編號'];
      const authorName = rawSeries['作者'];
      const itemName = rawSeries['品項名稱'];
      const onlyEvent = rawSeries['場內only攤位'];
      const cp = rawSeries['全員/單人/cp(可複選)'];
      const newProduct = rawSeries['新品/既品'];

      // 非品項列 (ex: 標題或空白列)
      if (!stallId && !authorName && !itemName) {
        // console.warn('wishlist item 缺少資料', stallId, authorName, 'rowIdx:', rowIdx);
        return;
      }

      // 當前攤位的第一列
      if (!!stallId) {
        currStallId = stallId;
        currOnlyEvent = onlyEvent === '是' ? true : false;
        currNewProduct = newProduct === '新品' ? true : false;
        this.cacheByStallId.add(stallId);
      }

      // 當前作者的第一列 (新的一位)
      if (authorName) {
        currAuthor = {
          stallId: currStallId,
          authorName,
          sns: [],
          items: [],
          onlyEvent: currOnlyEvent,
        };
        const key = this.keyForMapping({ stallId: currStallId, authorName } as C4R1Config);
        this.cache.set(key, currAuthor);
      }
      if (!currAuthor) return;

      const thId = `${this.htmlDocThKey}R${rowIdx}`;
      const snsTitle = rawSeries['作者SNS'];
      if (snsTitle) {
        const sns = this.getLink(snsTitle, thId, 1, 6);
        currAuthor.sns.push(sns);
      }

      if (!itemName && !cp) return;
      // 當前商品列有設定
      if (!!newProduct) {
        currNewProduct = newProduct === '新品' ? true : false;
      }

      const rated18 = rawSeries['一般向/R18向'];
      const category = rawSeries['商品類別'];
      const price = rawSeries['價格'];
      const promotionalTitle = rawSeries['宣傳頁面'];
      const note = rawSeries['備註'];
      const onlineSale = rawSeries['是否通販'];

      let promotional = { title: promotionalTitle, href: '' };
      if (promotionalTitle) {
        promotional = this.getLink(promotionalTitle, thId, 7, 15);
      }

      const freeCategory = category.includes('無料');
      const item: C4R1Data = {
        itemName,
        rated18: rated18 === 'R18' ? true : false,
        cp: cp.split(','),
        category: category.split(', '),
        newProduct: currNewProduct,
        price,
        promotional,
        note,
        onlineSale,
        freeCategory: !!freeCategory,
      };

      currAuthor.items.push(item);
    });
  }
}
