export interface StallSeriesDto {
  seriesId: string;

  seriesName: string;
}

export interface StallTagDto {
  tagId: string;

  tagName: string;

  tagType: 'CHAR' | 'CP';

  seriesId: string;

  seriesName: string;
}
