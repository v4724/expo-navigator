import { WishlistConfig, WishlistLink } from '../../base-model';

export interface C4LoveConfig extends WishlistConfig {}

export interface C4LoveAuthor {
  stallId: string;
  authorName: string;

  sns: WishlistLink[];
  items: C4LoveData[];
}
export interface C4LoveData {
  itemName: string;
  rated18: boolean;
  cp: string[];
  category: string;
  productInfo: string;
  newProduct: boolean;
  price: string;
  promotional: WishlistLink;
  note: string;
  freeCategory: boolean;
}
