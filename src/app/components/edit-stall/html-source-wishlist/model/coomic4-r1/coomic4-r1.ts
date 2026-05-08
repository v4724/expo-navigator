export interface C4R1Config {
  stallId: string; // excel 上的社團編號
  authorName: string;
}

export interface Link {
  title: string;
  href: string;
}
export interface C4R1Author {
  stallId: string;
  authorName: string;

  sns: Link[];
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
  promotional: Link;
  note: string;
  onlineSale: string;
}
