import { WishlistConfig, WishlistLink } from '../base-model';

export interface C4HeroMihayoConfig extends WishlistConfig {}

export interface C4HeroMihayoAuthor {
  stallId: string;
  authorName: string;

  sns: WishlistLink[];
  items: C4HeroMihayoData[];
}
export interface C4HeroMihayoData {
  subject: string; // 主題
  itemName: string;
  rated18: boolean;
  cp: string;
  category: string;
  newProduct: boolean; // false
  price: string;
  promotional: WishlistLink;
  note: string;
}
