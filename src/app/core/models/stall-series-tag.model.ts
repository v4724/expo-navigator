export interface StallSeriesDto {
  seriesId: number;

  seriesName: string;
}

export interface StallTagDto {
  tagId: number;

  tagName: string;

  tagType: 'CHAR' | 'CP';

  seriesId: number;

  seriesName: string;
}
