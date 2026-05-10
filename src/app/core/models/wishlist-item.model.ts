export interface WishlistItemDto {
  id: string;

  name: string;

  data: string;

  html: string;

  url: string;

  fillColor: string;
}
export interface WishlistLayerItem extends WishlistItemDto {
  checked: boolean;
}
