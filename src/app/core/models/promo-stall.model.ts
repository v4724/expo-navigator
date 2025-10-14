import { PromoLink } from '../interfaces/promo-link.interface';

/** Data from user-submitted promotions, representing a single promotion entry. */
export interface PromoStallDto {
  /** The ID of the stall this promotion belongs to. */
  id?: number;

  /** The ID of the stall this promotion belongs to. */
  stallId: string;
  /** The name of the user who submitted the promotion. */
  promoTitle: string;
  /** The URL of the user's avatar image. */
  promoAvatar: string;
  /** The main content of the promotion, can contain HTML. */
  promoHtml: string;
  /** An array of links associated with this specific promotion. */
  promoLinks: PromoLink[] | null;

  // 宣傳車作品
  series: number[] | null;

  // 宣傳車 tag
  tags: number[] | null;

  // 宣傳車自訂 tag
  customTags: string;
}
