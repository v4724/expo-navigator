import { StallDto } from 'src/app/core/interfaces/stall-dto.interface';

/**
 * Unified data structure for a single stall, combining all sources of info.
 * This is the final object used by the application logic for rendering and interaction.
 */
export interface StallData extends StallDto {
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

  hasPromo: boolean;

  isSearchMatch: boolean;
}
