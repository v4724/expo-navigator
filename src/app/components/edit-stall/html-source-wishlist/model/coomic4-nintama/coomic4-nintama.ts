import { WishlistConfig, WishlistLink } from '../base-model';

export interface C4NintamaConfig extends WishlistConfig {}

export interface C4NintamaAuthor {
  stallId: string;
  authorName: string;

  sns: WishlistLink[];
  items: C4NintamaData[];
}
export interface C4NintamaData {
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
