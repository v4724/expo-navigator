import { WishlistConfig, WishlistLink } from '../../base-model';

export interface C4KimetsuConfig extends WishlistConfig {}

export interface C4KimetsuAuthor {
  stallId: string;
  authorName: string;

  sns: WishlistLink[];
  items: C4KimetsuData[];
}
export interface C4KimetsuData {
  itemName: string;
  rated18: boolean;
  cp: string[];
  category: string;
  newProduct: boolean;
  price: string;
  promotional: WishlistLink;
  note: string;
}
