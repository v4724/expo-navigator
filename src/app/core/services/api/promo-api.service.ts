import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import { PromoStallDto, UpdatePromoStallDto } from '../../models/promo-stall.model';
import { PromoStall } from '../../interfaces/promo-stall.interface';
import { UpdateResponse } from '../../models/update-response.model';
import { PromoLink } from '../../interfaces/promo-link.interface';
import { env } from '@env/env'; // 根據實際路徑調整
import { UiStateService } from '../state/ui-state-service';

@Injectable({
  providedIn: 'root',
})
export class PromoApiService {
  private apiUrl = env.apiUrl;

  private readonly _uiStateService = inject(UiStateService);

  constructor(private http: HttpClient) {}

  getPromotions(): Observable<PromoStallDto[]> {
    return this.http.get<{ result: { data: PromoStallDto[] } }>(`${this.apiUrl}/api/promos`).pipe(
      tap((res) => console.debug(res)),
      // 只回傳 data 陣列
      map((res: { result: { data: PromoStallDto[] } }) => res.result.data),
    );
  }

  update(
    stallId: string,
    promos: UpdatePromoStallDto[],
  ): Observable<UpdateResponse<PromoStallDto>> {
    const data = promos.map((promo, index: number) => {
      const dto: PromoStallDto = {
        ...(promo.id && { id: promo.id }),
        stallId: promo.stallId,
        promoSort: promo.promoSort ?? index,
        promoTitle: promo.promoTitle,
        promoAvatar: promo.promoAvatar,
        promoHtml: promo.promoHtml,
        promoLinks: promo.promoLinks,
        series: promo.series,
        tags: promo.tags,
        customTags: promo.customTags,
      };
      return dto;
    });

    return this.http
      .put<UpdateResponse<PromoStallDto>>(`${this.apiUrl}/api/promos/${stallId}`, data)
      .pipe(tap((res) => console.debug(res)));
  }

  transformDtoToPromo(dto: PromoStallDto, index: number): PromoStall {
    // --- Promotion Data Aggregation ---
    // If the current row contains promotion data, create a PromoStall object
    // and add it to the stall's promoData array.
    const id = dto.id;
    const stallId = dto.stallId;
    const promoSort = dto.promoSort;
    const promoTitle = dto.promoTitle;
    const promoAvatar = dto.promoAvatar;
    const promoHtml = dto.promoHtml || '';

    const promo: PromoStall = {
      id,
      stallId,
      promoSort: promoSort ?? index,
      promoTitle: promoTitle,
      promoAvatar: promoAvatar,
      promoHtml: promoHtml,
      promoLinks: dto.promoLinks || [],
      series: dto.series || [],
      tags: dto.tags || [],
      customTags: dto.customTags,
    };

    if (typeof promo.promoLinks === 'string') {
      promo.promoLinks = [{ href: promo.promoLinks, text: '' }];
    }

    return promo;
  }

  /**
   * Parses a string of semi-colon delimited links into an array of PromoLink objects.
   * Expected format: "Link Text 1|http://...;Link Text 2|http://..."
   * @param linksStr The string to parse.
   * @returns An array of PromoLink objects.
   */
  private _parsePromoLinks(promoTitle: string, linksStr: string | undefined): PromoLink[] {
    if (!linksStr) return [];
    return linksStr
      .split(';')
      .map((part, index) => {
        const text = `${promoTitle}-宣傳車${index + 1}`;
        const href = part.trim();
        return { text, href };
      })
      .filter((link): link is PromoLink => link !== null && !!link.text && !!link.href); // Filter out invalid entries.
  }
}
