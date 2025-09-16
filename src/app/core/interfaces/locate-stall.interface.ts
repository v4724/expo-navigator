/**
 * Data for locating the start of a stall column on the map.
 * This is used as a template to calculate the exact position of each stall in that column.
 */
export interface LocateStall {
  /** The identifier for the column (e.g., "A", "B"). */
  id: string;
  /** The starting number for this column, usually 1. */
  num: number;
  /** The coordinates of the first stall in the column, used as a reference point. */
  coords: {
    top: number;
    left: number;
    width: number;
    height: number;
  };
  /** The bounding box for the entire row of stalls, used for accurate detection. */
  border: {
    top: number;
    left: number;
    bottom: number;
    right: number;
  };
  /** If true, this row is treated as a single clickable area. */
  isGrouped?: boolean;
}
