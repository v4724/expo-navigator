export interface StallSeries {
  id: string;

  name: string;

  advanced: AdvancedData;
}

export interface StallTag {
  id: string;

  name: string;
}

export interface AdvancedData {
  cp: StallTag[];
  char: StallTag[];
}

// Maps category to its selected advanced filter keys and values
export interface AdvancedFilters {
  [series: string]: {
    [key: string]: Set<string>;
  };
}
