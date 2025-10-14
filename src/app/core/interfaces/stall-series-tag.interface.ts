export interface StallSeries {
  id: number;

  name: string;

  advanced: AdvancedData;
}

export interface StallTag {
  id: number;

  name: string;
}

export interface AdvancedData {
  cp: StallTag[];
  char: StallTag[];
}

// Maps category to its selected advanced filter keys and values
export interface AdvancedFilters {
  [series: number]: {
    [key: string]: Set<number>;
  };
}
