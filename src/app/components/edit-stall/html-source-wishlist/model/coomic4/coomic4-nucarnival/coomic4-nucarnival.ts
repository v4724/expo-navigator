import { WishlistConfig, WishlistLink } from '../../base-model';

export interface C4NucarnivalConfig extends WishlistConfig {}

export interface C4NucarnivalAuthor {
  stallId: string;
  authorName: string;

  sns: WishlistLink[];
  items: C4NucarnivalData[];
}
export interface C4NucarnivalData {
  itemName: string;
  rated18: boolean;
  cp: string;
  category: string;
  productType: string; // 新刊／新品 or 既刊／既品 or 無料／交換
  price: string;
  promotional: WishlistLink;
  note: string;

  day1: boolean;
  day2: boolean;
}
