import { WishlistConfig, WishlistLink } from '../base-model';

export interface C4BokyakuConfig extends WishlistConfig {}

export interface C4BokyakuAuthor {
  stallId: string;
  authorName: string;

  sns: WishlistLink[];
  items: C4BokyakuData[];
}
export interface C4BokyakuData {
  itemName: string;
  rated18: boolean;
  cp: string;
  category: string;
  newProduct: boolean;
  price: string;
  promotional: WishlistLink;
  note: string;
}
