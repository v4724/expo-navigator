export interface MarkedListDto {
  id: number;
  userId: number;
  icon: string;
  iconColor: string;
  cusIcon: string;
  cusIconColor: string;
  isCusIcon: boolean;
  isCusIconColor: boolean;
  listName: string;
  list: string[];
}

export interface MarkedListUpdateDto extends MarkedListDto {}

export interface MarkedListCreateDto extends Omit<MarkedListDto, 'id'> {}
