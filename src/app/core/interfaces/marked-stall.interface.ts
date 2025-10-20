import { StallData } from 'src/app/core/interfaces/stall.interface';
import { MarkedListDto } from '../models/marked-stall.model';

export interface MarkedList extends Omit<MarkedListDto, 'list'> {
  list: StallData[];

  show: boolean;

  isDeleting: boolean;
}
