import { WishlistConfig, WishlistLink } from '../../base-model';

export interface C4OrigConfig extends WishlistConfig {}

export interface C4OrigAuthor {
  stallId: string;
  authorName: string;

  sns: WishlistLink[];
  items: C4OrigData[];
}
export interface C4OrigData {
  itemName: string;
  subject: string;
  rated18: boolean;
  cp: string[];
  category: string;
  newProduct: boolean;
  price: string;
  preview: WishlistLink;
  promotional: WishlistLink;
  note: WishlistLink;
  freeCategory: boolean;
}
