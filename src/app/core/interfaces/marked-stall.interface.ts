import { StallData } from 'src/app/core/interfaces/stall.interface';
import { MarkedListDto } from '../models/marked-stall.model';

export interface MarkedStallInfo {
  stall: StallData;
  note: string;
}
export interface MarkedList extends Omit<MarkedListDto, 'list'> {
  list: MarkedStallInfo[];

  show: boolean;

  isUpdating: boolean;

  isDeleting: boolean;

  showPath: boolean;
}
