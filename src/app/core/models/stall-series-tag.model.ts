export interface StallSeriesDto {
  seriesId: number;

  seriesName: string;
}

export interface StallGroupDto {
  groupId: number;

  groupName: string;

  seriesId: number;

  seriesName: string;
}

export interface StallTagDto {
  tagId: number;

  tagName: string;

  tagType: 'CHAR';

  groupId: number;

  groupName: string;

  addGroupName: boolean;
}
