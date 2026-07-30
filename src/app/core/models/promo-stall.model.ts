import { PromoLink } from '../interfaces/promo-link.interface';

/** Data from user-submitted promotions, representing a single promotion entry. */
export interface PromoStallDto {
  /** The ID of the stall this promotion belongs to. */
  id?: number;

  /** The ID of the stall this promotion belongs to. */
  stallId: string;

  promoSort: number;

  /** The name of the user who submitted the promotion. */
  promoTitle: string;
  /** The URL of the user's avatar image. */
  promoAvatar: string;

  // 宣傳車 HTML 來源選項
  promoHtmlSourceOption: 'CUSTOM' | 'WISHLIST';
  promoHtmlWishlistId?: string;
  promoHtmlWishlistConfigJson?: string; // API 取出來會是 object，保持轉成 string
  /** The main content of the promotion, can contain HTML. */
  promoHtml: string;

  /** An array of links associated with this specific promotion. */
  promoLinks: PromoLink[] | null;

  // 宣傳車作品
  series: number[] | null;

  // 宣傳車 tag
  tags: number[] | null;

  // 宣傳車作品/主題 tag
  subjectTags: string;

  // 宣傳車自訂 tag
  customTags: string;
}

export interface UpdatePromoStallDto extends PromoStallDto {}
