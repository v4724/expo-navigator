import { WishlistConfig, WishlistLink } from '../base-model';

export interface C4R1Config extends WishlistConfig {}

export interface C4R1Author {
  stallId: string;
  authorName: string;

  sns: WishlistLink[];
  items: C4R1Data[];
}
export interface C4R1Data {
  onlyEvent: boolean;
  itemName: string;
  rated18: boolean;
  cp: string[];
  category: string[];
  newProduct: boolean;
  price: string;
  promotional: WishlistLink;
  note: string;
  onlineSale: string;
}
