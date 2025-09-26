import { StallData } from 'src/app/components/stall/stall.interface';
import { MarkedStallDto } from '../models/marked-stall.model';

export interface MarkedStall extends MarkedStallDto {
  info: StallData;
}
