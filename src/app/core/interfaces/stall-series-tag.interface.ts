export interface StallSeries {
  id: number;

  name: string;

  groups: StallGroup[];

  checked: boolean;
}
export interface StallGroup {
  id: number;

  name: string;

  tags: StallTag[];
}

export interface StallTag {
  id: number;

  name: string;

  checked: boolean;
}

// Maps category to its selected advanced filter keys and values
export interface AdvancedFilters {
  [seriesId: number]: {
    [groupId: number]: Set<number>;
  };
}
