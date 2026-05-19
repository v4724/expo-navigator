import { Injectable } from '@angular/core';
import { C4HeroMihayoAuthor, C4HeroMihayoConfig, C4HeroMihayoData } from './coomic4-hero-mihayo';
import { BaseService } from '../base-service';

@Injectable({
  providedIn: 'root',
})
export class Coomic4MihayoService extends BaseService<C4HeroMihayoAuthor> {
  override headerIdx = 1;
  override htmlDocThKey = '0';

  override processData(rawData: Record<string, string>[], htmlText: string) {
    let currAuthor: C4HeroMihayoAuthor;
    let currDay = '',
      currStallId = '',
      currCp = '',
      currCategory = '';

    console.log('processData', rawData);
    rawData.forEach((rawSeries, rowIdx) => {
      const day = rawSeries['DAY\n（可複選）'];
      const stallId = rawSeries['攤位'];
      const authorName = rawSeries['作者'];
      const itemName = rawSeries['商品名稱'];
      const cp = rawSeries['角色／ＣＰ'];
      const category = rawSeries['商品類型'];

      // 任一有值代表是下一筆攤位資料
      if (day || stallId) {
        currDay = day;
        if (stallId === 'D1 E32\nD2 L50') {
          currStallId = 'E32';
        } else if (stallId === 'D1 L33\nD2 L44') {
          currStallId = 'L33';
        } else if (stallId === 'D1 L38\nD2 G78') {
          currStallId = 'L38';
        } else if (stallId === 'D1 L73\nD2 L69') {
          currStallId = 'L73';
        } else {
          currStallId = stallId;
        }
      }

      if (!currDay.includes('D1')) {
        return;
      }
      currCp = cp ? cp : currCp;
      currCategory = category ? category : currCategory;

      // 非品項列 (ex: 標題或空白列)
      if (!stallId && !authorName && !itemName) {
        // console.warn('wishlist item 缺少資料', stallId, authorName, itemName, 'rowIdx:', rowIdx);
        return;
      }
      if (!!currStallId) {
        this.cacheByStallId.add(currStallId);
      }

      // 當前作者的第一列 (新的一位)
      const key = this.keyForMapping({ stallId: currStallId, authorName } as C4HeroMihayoConfig);
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
      if (!currAuthor) {
        return;
      }

      const thId = `${this.htmlDocThKey}R${rowIdx}`;
      const snsTitle = rawSeries['作者'];
      if (snsTitle) {
        // 特別處理
        const sns = this.getLink(snsTitle, thId, 1, 15);
        const find = currAuthor.sns.find(
          (item) => item.href === sns.href || item.title === sns.title,
        );
        if (!find) {
          currAuthor.sns.push(sns);
        }
      }

      if (!itemName && !cp) {
        return;
      }

      const subject = rawSeries['作品'];
      const price = rawSeries['價格'];
      const promotionalTitle = rawSeries['宣傳車'];
      const note = rawSeries['備註'];

      let promotional = { title: promotionalTitle, href: '' };
      if (promotionalTitle) {
        promotional = this.getLink(promotionalTitle, thId, 1, 15);
      }

      const item: C4HeroMihayoData = {
        subject,
        cp,
        category,
        itemName,
        rated18: false,
        price,
        newProduct: false,
        promotional,
        note,
      };
      currAuthor.items.push(item);
    });
  }
}
