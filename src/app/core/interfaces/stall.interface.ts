import { StallDto } from '../models/stall.model';
import { PromoStall } from './promo-stall.interface';

/**
 * Unified data structure for a single stall, combining all sources of info.
 * This is the final object used by the application logic for rendering and interaction.
 */
export interface StallData extends Omit<StallDto, 'promotion'> {
  padNum: string;

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

  promoData: PromoStall[];

  hasPromo: boolean;

  isSearchMatch: boolean;

  // 快速搜尋用
  filterTags: number[];

  filterSeries: number[];

  filterCustomTags: string[];
}
