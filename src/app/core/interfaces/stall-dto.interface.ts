import { PromoStall } from './promo-stall.interface';

/**
 * Unified data structure for a single stall, combining all sources of info.
 * This is the final object used by the application logic for rendering and interaction.
 */
export interface StallDto {
  /** The unique identifier for the stall (e.g., "A01"). */
  id: string;

  /** The stall number (e.g., 1 for "A01"). */
  num: number;

  stallCnt: number;

  // Official data from event site
  /** The official title or name of the stall. */
  stallTitle: string;

  /** The optional URL for the stall's official promotional image. */
  stallImg?: string;

  /** The optional URL for the stall's main website or social media. */
  stallLink?: string;

  /** An array of all user-submitted promotions associated with this stall. */
  promoData: PromoStall[];

  promoTags: string[];
}
