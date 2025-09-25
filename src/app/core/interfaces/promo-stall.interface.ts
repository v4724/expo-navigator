import { PromoLink } from './promo-link.interface';

/** Data from user-submitted promotions, representing a single promotion entry. */
export interface PromoStall {
  /** The ID of the stall this promotion belongs to. */
  stallId: string;
  /** The name of the user who submitted the promotion. */
  promoUser: string;
  /** The URL of the user's avatar image. */
  promoAvatar: string;
  /** The main content of the promotion, can contain HTML. */
  promoHTML: string;
  /** An array of links associated with this specific promotion. */
  promoLinks: PromoLink[];

  promoTags: string[];

  // 宣傳車作品
  series: string[];

  // 宣傳車 tag
  tags: string[];
}
