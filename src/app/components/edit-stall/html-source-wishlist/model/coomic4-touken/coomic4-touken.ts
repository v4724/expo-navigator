import { WishlistConfig, WishlistLink } from '../base-model';

export interface C4ToukenConfig extends WishlistConfig {}

export interface C4ToukenAuthor {
  stallId: string;
  authorName: string;

  sns: WishlistLink[];
  items: C4ToukenData[];
}
export interface C4ToukenData {
  itemName: string;
  rated18: boolean;
  cp: string;
  category: string;
  newProduct: boolean; // 新刊/品 or 既刊/品
  price: string;
  promotional: WishlistLink;
  note: string;

  day1: string;
  day2: string;
}
