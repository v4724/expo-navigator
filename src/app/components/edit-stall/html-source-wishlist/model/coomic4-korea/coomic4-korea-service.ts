import { Injectable } from '@angular/core';
import { C4KoreaAuthor, C4KoreaConfig, C4KoreaData } from './coomic4-korea';
import { BaseService } from '../base-service';

@Injectable({
  providedIn: 'root',
})
export class Coomic4KoreaService extends BaseService<C4KoreaAuthor> {
  override headerIdx = 2;
  override htmlDocThKey = '0';
  // override hrefClass = 's12';

  override processData(rawData: Record<string, string>[], htmlText: string) {
    let currAuthor: C4KoreaAuthor;
    let currStallZone = '',
      currStallNum = '';

    console.log('processData', rawData);
    rawData.forEach((rawSeries, rowIdx) => {
      const stallZone = rawSeries['攤位號碼\nBooth Number\n부스 번호'];
      const stallNum = rawSeries[''];
      const authorName = rawSeries['作者\nAuthor\n작가'];
      const itemName =
        rawSeries[
          '書名或商品名稱（R18請標紅字）\nName of Products（red text for R-18）\n책 제목  / 굿즈（18금 품목은 빨간색으로 표기）'
        ];

      // 任一有值代表是下一筆攤位資料
      if (stallZone || stallNum) {
        currStallZone = stallZone;
        currStallNum = stallNum.padStart(2, '0');
      }
      if (stallNum) {
        currStallNum = stallNum.padStart(2, '0');
      }
      const stallId = currStallZone + currStallNum;

      // 非品項列 (ex: 標題或空白列)
      if (!stallId && !authorName && !itemName) {
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
        const key = this.keyForMapping({ stallId, authorName } as C4KoreaConfig);
        this.cache.set(key, currAuthor);
      }
      if (!currAuthor) {
        return;
      }

      const thId = `${this.htmlDocThKey}R${rowIdx}`;
      const snsTitle = rawSeries['作者\nAuthor\n작가'];
      if (snsTitle) {
        const sns = this.getLink(snsTitle, thId, 1, 15);
        currAuthor.sns.push(sns);
      }

      if (!itemName) {
        return;
      }

      const cp = rawSeries['配對 / 角色\nCP / Character\n커플 / 인물'];
      const category = rawSeries['主題類型\nCategorires\n카테고리'];
      const newProduct = rawSeries['新品 / 既品\nNew or Released\n신상품 / 새상품'];
      const price = rawSeries['售價\nPrice\n가격'];
      const promotionalTitle = rawSeries['資訊頁面\nInfo Link\n인포 링크'];
      const note = rawSeries['備註\nNote\n비고'];

      let promotional = { title: promotionalTitle, href: '' };
      if (promotionalTitle) {
        promotional = this.getLink(promotionalTitle, thId, 1, 15);
      }
      const rated18 = this.isRated18Item(thId, itemName);

      const item: C4KoreaData = {
        cp,
        category,
        itemName,
        rated18,
        price,
        newProduct: newProduct === 'New' ? true : false,
        promotional,
        note,
      };

      currAuthor.items.push(item);
    });
  }

  isRated18Item(thId: string, text: string): boolean {
    // 建立一個暫時的 DOM 解析器
    const th = this.htmlDoc?.getElementById(thId);
    const tr = th ? th.closest('tr') : null;

    if (!tr) {
      console.debug('未找到指定 TR', thId, th, !!this.htmlDoc);
      return false;
    }

    const tds = tr.querySelectorAll(`td.s20`);
    let isRated18 = false;
    tds.forEach((td) => {
      const innerText = (td as HTMLTableCellElement).innerText;
      if (innerText === text) {
        isRated18 = true;
        return;
      }
    });

    return isRated18;
  }
}
