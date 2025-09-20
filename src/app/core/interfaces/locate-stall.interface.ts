export type GroupDirection = 'horizontal' | 'vertical';
export type AnchorSide = 'top' | 'bottom' | 'left' | 'right';

/**
 * Data for locating the start of a stall column on the map.
 * This is used as a template to calculate the exact position of each stall in that column.
 */
export interface StallGroupGridRef {
  /** The identifier for the group (e.g., "A", "B"). */
  groupId: string;

  /** The starting number for this column, usually 1. */
  anchorStallNum: number;

  // 預設選擇攤位id
  groupDefaultStallId?: string;

  // TODO
  // 共幾排
  trackCnt?: number;

  // TODO
  // 共幾區
  blockCnt?: number;

  // TODO
  // 一區多少攤
  blockStallCnt?: number;

  // TODO
  // 每區的間距
  blockGapDis?: number;

  // TODO
  // 攤位方向
  directions?: GroupDirection;

  // TODO
  // 攤位起點方向
  trackDirections?: AnchorSide[];

  // TODO
  // 起點位於該排的哪個位置
  anchorSide?: AnchorSide;

  /** The coordinates of the first stall in the column, used as a reference point. */
  anchorStallRect: {
    top: number;
    left: number;
    width: number;
    height: number;
  };

  /** The bounding box for the entire row of stalls, used for accurate detection. */
  boundingBox: {
    top: number;
    left: number;
    bottom: number;
    right: number;
  };

  /** If true, this row is treated as a single clickable area. */
  isGrouped?: boolean;
}
