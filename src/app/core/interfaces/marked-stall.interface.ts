import { StallData } from 'src/app/components/stall/stall.interface';
import { MarkedListDto } from '../models/marked-stall.model';

export interface MarkedList extends Omit<MarkedListDto, 'list'> {
  list: { stallId: string; stallInfo: StallData }[];

  show: boolean;
}
