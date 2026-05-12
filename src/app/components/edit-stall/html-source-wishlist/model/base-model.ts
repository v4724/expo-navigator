export interface WishlistConfig {
  stallId: string; // excel 上的社團編號
  authorName: string;
}

export interface WishlistLink {
  title: string;
  href: string;
}

export interface WishlistAuthor {
  stallId: string;
  authorName: string;

  sns: WishlistLink[];
  items: WishlistProductData[];
}

export interface WishlistProductData {
  subject: string;
  itemName: string;
  rated18: boolean;
  cp: string[];
  category: string[];
  newProduct: boolean;
  price: string;
  promotional: WishlistLink;
  note: string;
  freeCategory: boolean;
}
