import { PromoStall } from './promo-stall.interface';

/**
 * Unified data structure for a single stall, combining all sources of info.
 * This is the final object used by the application logic for rendering and interaction.
 */
export interface StallData {
  /** The unique identifier for the stall (e.g., "A01"). */
  id: string;
  /** The stall number (e.g., 1 for "A01"). */
  num: number;

  stallCnt: number;
  /** The calculated string-based coordinates and dimensions for the stall's interactive area on the map. */
  coords: {
    top: string;
    left: string;
    width: string;
    height: string;
  };
  /** Pre-calculated numeric coordinates for performant calculations in JS. */
  numericCoords: {
    top: number;
    left: number;
    width: number;
    height: number;
  };
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
