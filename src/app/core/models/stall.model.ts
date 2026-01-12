import { PromoStallDto } from './promo-stall.model';

/**
 * Unified data structure for a single stall, combining all sources of info.
 * This is the final object used by the application logic for rendering and interaction.
 */
export interface StallDto {
  /** The unique identifier for the stall (e.g., "A01"). */
  id: string;

  /** The stall zone (e.g., A for "A01"). */
  stallZone: string;

  /** The stall number (e.g., 1 for "A01"). */
  stallNum: number;

  stallCnt: number;

  // Official data from event site
  /** The official title or name of the stall. */
  stallTitle: string;

  stallAuthor: string;

  /** The optional URL for the stall's official promotional image. */
  stallImg?: string;

  /** The optional URL for the stall's main website or social media. */
  stallLink?: string;

  hasPrintSurvey?: boolean;

  /** An array of all user-submitted promotions associated with this stall. */
  promotion: PromoStallDto[];
}

export interface UpdateStallDto {
  // Official data from event site
  /** The official title or name of the stall. */
  stallTitle: string;

  stallAuthor: string;

  /** The optional URL for the stall's official promotional image. */
  stallImg?: string;

  /** The optional URL for the stall's main website or social media. */
  stallLink?: string;

  hasPrintSurvey?: boolean;
}

export interface UpdateStallDtoWithPromo extends UpdateStallDto {
  promotion: PromoStallDto[];
}
