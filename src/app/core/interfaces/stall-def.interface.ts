export interface StallGridDef {
  zoneId: string;
  stallDefs: StallRule[];
  groupDef: StallGroupRule;
  isGrouped: boolean;
}

export interface StallRule {
  start: number;
  end: number;
  blockStallCnt: number;
  blockGap: number;
  width: number;
  height: number;
  anchorRect: {
    top: number;
    left: number;
  };
  direction: StallRuleDirectionType;
}

export interface StallGroupRule {
  isGrouped: boolean;
  defaultStallId: string;
  skipStart: number;
  skipEnd: number;
  boundingBox: {
    top: number;
    left: number;
    bottom: number;
    right: number;
  };
}

export type StallRuleDirectionType = 'right' | 'left' | 'top' | 'bottom';
