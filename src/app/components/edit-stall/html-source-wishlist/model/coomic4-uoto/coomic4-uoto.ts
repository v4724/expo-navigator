import { WishlistConfig, WishlistLink } from '../base-model';

export interface C4UotoConfig extends WishlistConfig {}

export interface C4UotoAuthor {
  stallId: string;
  authorName: string;

  sns: WishlistLink[]; // 作者SNS
  items: C4UotoData[];
}
export interface C4UotoData {
  itemName: string; // 品項名稱
  category: string; // 品項類別
  originalWork: string; //原作
  price: string; //價格
  cp: string; // CP向
  rated18: boolean; // 是否有R18
  detail: WishlistLink; // 詳細資訊
  promotional: WishlistLink; // 工商連結
  onlineSale: WishlistLink; // 通販連結
  note: string; // 備註
}
