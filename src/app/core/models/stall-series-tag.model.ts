export interface StallSeriesDto {
  seriesId: number;

  seriesName: string;
}

export interface StallGroupDto {
  groupId: number;

  groupName: string;

  groupSort: number;

  seriesId: number;

  seriesName: string;
}

export interface StallTagDto {
  tagId: number;

  tagName: string;

  tagSort: number;

  tagType: 'CHAR';

  groupId: number;

  groupName: string;

  addGroupName: boolean;
}
