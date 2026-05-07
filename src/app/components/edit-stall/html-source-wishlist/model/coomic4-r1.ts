import { from } from 'rxjs';
import { fetchExcelData } from 'src/app/utils/google-excel-data-loader';

export interface C4R1Config {
  authorName: string;
  stallId: string;
}

export function loadData(url: string, data: C4R1Config) {
  console.log('Loading data with url:', url, 'and config:', data);
  return from(
    fetchExcelData(url).then((rawData: Record<string, string>[]) => {
      let currStallId = '';
      let currAuthor = '';
      const items: any[] = [];
      rawData.forEach((rawSeries, rowIdx) => {
        const stallId = rawSeries['社團編號'];
        const author = rawSeries['作者'];
        const name = rawSeries['品項名稱'];

        if (stallId) {
          currStallId = stallId.trim();
        }
        if (author) {
          currAuthor = author.trim();
        }

        if (!stallId && !author && !name) {
          console.warn('wishlist item 缺少資料', stallId, author, 'rowIdx:', rowIdx);
          return;
        }

        if (currStallId === data.stallId && currAuthor === data.authorName) {
          const adult = rawSeries['一般向/R18向'];
          const gender = rawSeries['全員/單人/cp(可複選)'];
          const category = rawSeries['商品類別'];
          const newOrResold = rawSeries['新品/既品'];
          const price = rawSeries['價格'];
          const notes = rawSeries['備註'];
          const isOnline = rawSeries['是否通販'];
          const item = {
            name,
            adult,
            gender,
            category,
            newOrResold,
            price,
            notes,
            isOnline,
          };
          items.push(item);

          console.log('解析後的 item:', item); // Debug log
        }
      });

      return items;
    }),
  );
}
