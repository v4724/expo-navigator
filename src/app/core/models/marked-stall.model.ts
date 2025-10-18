export interface MarkedListDto {
  id: number;
  userId: number;
  icon: string;
  iconColor: string;
  isDefaultColor: boolean;
  listName: string;
  list: string[];
}

export interface MarkedListUpdateDto extends MarkedListDto {}

export interface MarkedListCreateDto extends Omit<MarkedListDto, 'id'> {}
