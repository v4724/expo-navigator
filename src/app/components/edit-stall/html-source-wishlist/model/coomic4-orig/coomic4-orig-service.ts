import { Injectable } from '@angular/core';
import { C4OrigAuthor, C4OrigConfig, C4OrigData } from './coomic4-orig';
import { BaseService } from '../base-service';
import { WishlistLink } from '../base-model';

@Injectable({
  providedIn: 'root',
})
export class Coomic4OrigService extends BaseService<C4OrigAuthor> {
  override htmlDocThKey = '0';
  override headerIdx = 2;

  override processData(rawData: Record<string, string>[], htmlText: string) {
    let currAuthor: C4OrigAuthor,
      currDay1 = '',
      currDay2 = '';

    console.log(rawData);
    rawData.forEach((rawSeries, rowIdx) => {
      const stallId = rawSeries['攤位號\nDAY1'];
      const day2 = rawSeries['攤位號\nDAY2'];
      const authorName = rawSeries['作者'];
      const itemName = rawSeries['書名/品名'];
      const cp = rawSeries['CP、設定'];
      const newProduct = rawSeries['新刊/品\n既刊/品\n無料'];

      // 任一有值代表是下一筆攤位資料
      if (stallId || day2) {
        currDay1 = stallId;
        currDay2 = day2;
      }
      // 只有 Day2
      if (!currDay1 && currDay2) {
        // console.log('Skipping row:', rowIdx, rawSeries);
        return;
      }

      // 當前攤位的第一列
      if (!!stallId) {
        this.cacheByStallId.add(stallId);
      }

      // 當前作者的第一列 (新的一位)
      const key = this.keyForMapping({ stallId: currDay1, authorName } as C4OrigConfig);
      const existAuthor = this.cache.get(key);
      if (authorName && !existAuthor) {
        currAuthor = {
          stallId: currDay1,
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
      const snsTitle = rawSeries['作者'].trim();
      if (snsTitle) {
        // 特別處理
        if (snsTitle === 'ZIYO / 一個獄') {
          currAuthor.sns = [
            { title: 'ZIYO', href: 'https://www.plurk.com/yukino0428' },
            { title: '一個獄', href: 'https://www.plurk.com/Kira723' },
          ];
        } else {
          const sns = this.getLink(snsTitle, thId, 1, 15);
          const find = currAuthor.sns.find(
            (item) => item.href === sns.href || item.title === sns.title,
          );
          if (!find) {
            currAuthor.sns.push(sns);
          }
        }
      }

      if (!itemName && !cp) return;

      const rated18 = rawSeries['R18'];
      const subject = rawSeries['屬性'];
      const category = rawSeries['類別\n[小說/漫畫/插畫]\n[合本/繪本/周邊]'];
      const price = rawSeries['價格'];
      const promotionalTitle = rawSeries['宣傳連結'];
      const pewviewTitle = rawSeries['試閱'];
      const noteTitle = rawSeries['其他資訊/備註'];

      let promotional = { title: promotionalTitle, href: '' };
      if (promotionalTitle) {
        promotional = this.getLink(promotionalTitle, thId, 1, 15);
      }
      let prview = { title: pewviewTitle, href: '' };
      if (pewviewTitle) {
        prview = this.getLink(pewviewTitle, thId, 1, 15);
      }
      let note = { title: noteTitle, href: '' };
      if (noteTitle) {
        note = this.getLink(noteTitle, thId, 1, 15);
      }

      const freeCategory = newProduct.includes('無料');
      const item: C4OrigData = {
        itemName,
        subject,
        rated18: rated18 === 'R18' ? true : false,
        cp: cp
          .split('#')
          .map((val) => val.trim())
          .filter((val) => !!val),
        category: category.trim(),
        newProduct: newProduct === '新刊' || newProduct === '新品' ? true : false,
        price,
        preview: prview,
        promotional,
        note,
        freeCategory: !!freeCategory,
      };

      currAuthor.items.push(item);
    });
  }
}
