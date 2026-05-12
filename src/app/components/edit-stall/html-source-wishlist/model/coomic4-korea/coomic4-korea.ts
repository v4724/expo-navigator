import { WishlistConfig, WishlistLink } from '../base-model';

export interface C4KoreaConfig extends WishlistConfig {}

export interface C4KoreaAuthor {
  stallId: string;
  authorName: string;

  sns: WishlistLink[];
  items: C4KoreaData[];
}
export interface C4KoreaData {
  subject: string; // 主題
  itemName: string;
  rated18: boolean;
  cp: string;
  category: string;
  newProduct: boolean; // 新刊/品 or 既刊/品
  price: string;
  promotional: WishlistLink;
  note: string;
}
