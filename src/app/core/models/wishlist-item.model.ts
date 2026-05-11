export interface WishlistItemDto {
  id: string;

  name: string;

  data: string;

  html: string;

  url: string;

  tag: string;

  fillColor: string;
}
export interface WishlistLayerItem extends WishlistItemDto {
  checked: boolean;
}
