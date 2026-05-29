import { WishlistConfig, WishlistLink } from '../../base-model';

export interface C4NijisanjiConfig extends WishlistConfig {}

export interface C4NijisanjiAuthor {
  stallId: string;
  authorName: string;

  sns: WishlistLink[];
  items: C4NijisanjiData[];
}
export interface C4NijisanjiData {
  itemName: string;
  rated18: boolean;
  cp: string;
  category: string;
  newProduct: boolean;
  price: string;
  promotional: WishlistLink;
  note: string;
  freeCategory: boolean;
}
