import { Injectable } from '@angular/core';
import { C4KoreaAuthor, C4KoreaConfig, C4KoreaData } from './coomic4-korea';
import { BaseService } from '../../base-service';
import { WishlistLink } from '../../base-model';

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
      const cp = rawSeries['配對 / 角色\nCP / Character\n커플 / 인물'];

      // 任一有值代表是下一筆攤位資料
      if (stallZone || stallNum) {
        currStallZone = stallZone;
        currStallNum = stallNum.padStart(2, '0');
      }
      if (stallNum) {
        currStallNum = stallNum.padStart(2, '0');
      }
      let stallId = currStallZone + currStallNum;
      if (currStallNum.includes('/')) {
        const arr = currStallNum.split('/');
        stallId = `${currStallZone}${arr[0]}/${currStallZone}${arr[1]}`;
      }

      // 非品項列 (ex: 標題或空白列)
      if (!stallId && !authorName && !itemName) {
        // console.warn('wishlist item 缺少資料', stallId, authorName, itemName, 'rowIdx:', rowIdx);
        return;
      }
      if (!!stallId) {
        this.cacheByStallId.add(stallId);
      }

      // 當前作者的第一列 (新的一位)
      const key = this.keyForMapping({ stallId, authorName } as C4KoreaConfig);
      const existAuthor = this.cache.get(key);
      if (authorName && !existAuthor) {
        currAuthor = {
          stallId,
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
      const snsTitle = rawSeries['作者\nAuthor\n작가'];
      if (snsTitle) {
        // 特別處理
        if (snsTitle === '司藍的空想旅團\nKOPAKO') {
          const links = this.getN75Link(thId);
          currAuthor.sns = currAuthor.sns.concat(links);
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

      if (!itemName && !cp) {
        return;
      }

      const subject = rawSeries['韓國創作主題\nFandoms\n팬덤'];
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
        subject,
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

    // class樣式不一定
    const tds = tr.querySelectorAll(`td.s19`);
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

  getN75Link(thId: string): WishlistLink[] {
    // 建立一個暫時的 DOM 解析器
    const th = this.htmlDoc?.getElementById(thId);
    const tr = th ? th.closest('tr') : null;

    if (!tr) {
      console.debug('未找到指定 TR', thId, th, !!this.htmlDoc);
      return [];
    }

    const links: WishlistLink[] = [];
    const tds = tr.querySelectorAll(`td:has(a)`);
    tds.forEach((td) => {
      if (td.children.length > 1) {
        Array.from(td.children).forEach((a) => {
          const innerText = (a as HTMLLinkElement).innerText;
          const href = (a as HTMLLinkElement)?.href;
          links.push({ title: innerText, href: href });
        });
      }
    });

    return links;
  }
}
