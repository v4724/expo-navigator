import { inject, Injectable } from '@angular/core';
import { WishlistAuthor, WishlistConfig, WishlistProductData } from './base-model';
import { BaseService } from './base-service';

@Injectable({
  providedIn: 'root',
})
export class WishlistDefaultService extends BaseService<WishlistAuthor> {
  // 依照來源調整
  override headerIdx = 0; // google excel title(0 base)
  override htmlDocThKey = '0'; // google excel gid

  override processData(rawData: Record<string, string>[], htmlText: string) {
    let currAuthor: WishlistAuthor,
      currStallId = '',
      currNewProduct = false;

    console.log(rawData);
    rawData.forEach((rawSeries, rowIdx) => {
      const stallId = rawSeries['攤位編號 (必填)'];
      const authorName = rawSeries['作者or攤主 (必填)'];
      const itemName = rawSeries['商品名稱'];
      const cp = rawSeries['CP/角色 (多筆可用, 分隔)'];
      const newProduct = rawSeries['新品/既品'];

      // 非品項列 (ex: 標題或空白列)
      if (!stallId && !authorName && !itemName) {
        // console.warn('wishlist item 缺少資料', stallId, authorName, 'rowIdx:', rowIdx);
        return;
      }

      // 當前攤位的第一列
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
        const key = this.keyForMapping({ stallId: currStallId, authorName } as WishlistConfig);
        this.cache.set(key, currAuthor);
      }
      if (!currAuthor) return;

      const thId = `${this.htmlDocThKey}R${rowIdx}`;
      const snsTitle = rawSeries['作者or攤主 (必填)'];
      if (snsTitle) {
        const sns = this.getLink(snsTitle, thId, 1, 6);
        currAuthor.sns.push(sns);
      }

      if (!itemName && !cp) return;
      // 當前商品列有設定
      if (!!newProduct) {
        currNewProduct = newProduct === '新品' ? true : false;
      }

      const subject = rawSeries['作品'];
      const rated18 = rawSeries['成人向R18'];
      const category = rawSeries['商品類別 (多筆可用, 分隔)'];
      const price = rawSeries['價格'];
      const promotionalTitle = rawSeries['宣傳/資訊網頁'];
      const note = rawSeries['備註'];

      let promotional = { title: promotionalTitle, href: '' };
      if (promotionalTitle) {
        promotional = this.getLink(promotionalTitle, thId, 7, 15);
      }

      const freeCategory = rawSeries['無料'];
      const item: WishlistProductData = {
        subject,
        itemName,
        rated18: rated18 === 'TRUE' ? true : false,
        cp: cp.split(','),
        category: category.split(', '),
        newProduct: currNewProduct,
        price,
        promotional,
        note,
        freeCategory: freeCategory === 'TRUE' ? true : false,
      };

      currAuthor.items.push(item);
    });
  }
}
