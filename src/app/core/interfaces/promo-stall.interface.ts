import { PromoStallDto } from '../models/promo-stall.model';
import { PromoLink } from './promo-link.interface';

/** Data from user-submitted promotions, representing a single promotion entry. */
export interface PromoStall extends Omit<PromoStallDto, 'promoLinks' | 'series' | 'tags'> {
  promoLinks: PromoLink[];

  series: number[];

  tags: number[];
}
