import { WishlistConfig, WishlistLink } from '../base-model';

export interface C4100MConfig extends WishlistConfig {}

export interface C4100MAuthor {
  stallId: string;
  authorName: string;

  sns: WishlistLink[];
  items: C4100MData[];
}
export interface C4100MData {
  itemName: string;
  rated18: boolean;
  cp: string;
  category: string;
  newProduct: boolean;
  price: string;
  promotional: WishlistLink;
  note: string;
}
