import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import { PromoStallDto } from '../../models/promo-stall.model';
import { PromoStall } from '../../interfaces/promo-stall.interface';
import { UpdateResponse } from '../../models/update-response.model';
import { PromoLink } from '../../interfaces/promo-link.interface';
import DOMPurify from 'dompurify';

@Injectable({
  providedIn: 'root',
})
export class PromoApiService {
  private apiUrl = 'https://expo-navigator-worker.v47244724.workers.dev'; // 根據實際 API 路徑調整

  constructor(private http: HttpClient) {}

  getPromotions(): Observable<PromoStallDto[]> {
    return this.http.get<{ result: { data: PromoStallDto[] } }>(`${this.apiUrl}/api/promos`).pipe(
      tap((res) => console.log(res)),
      // 只回傳 data 陣列
      map((res: { result: { data: PromoStallDto[] } }) => res.result.data),
    );
  }

  update(stallId: string, promos: PromoStall[]): Observable<UpdateResponse<PromoStallDto>> {
    const data = promos.map((promo) => {
      const dto: PromoStallDto = {
        ...(promo.id && { id: promo.id }),
        stallId: promo.stallId,
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
      .post<UpdateResponse<PromoStallDto>>(`${this.apiUrl}/api/promos/${stallId}`, data)
      .pipe(tap((res) => console.log(res)));
  }

  transformDtoToPromo(dto: PromoStallDto): PromoStall {
    // --- Promotion Data Aggregation ---
    // If the current row contains promotion data, create a PromoStall object
    // and add it to the stall's promoData array.
    const id = dto.id;
    const stallId = dto.stallId;
    const promoTitle = dto.promoTitle;
    const promoAvatar = dto.promoAvatar;
    let promoHtml = dto.promoHtml || '';
    if (promoHtml.includes('iframe') && promoHtml.includes('https://www.facebook.com/plugins')) {
      promoHtml = this._preserveSizeAttributes(promoHtml);
      promoHtml = DOMPurify.sanitize(promoHtml || '', {
        ADD_TAGS: ['iframe'],
        FORBID_TAGS: [], // 確保不會誤封 iframe
        ALLOWED_URI_REGEXP: /^https:\/\/(www\.)?facebook\.com\/plugins\//i,
      });
    } else {
      promoHtml = DOMPurify.sanitize(promoHtml || '');
    }

    const promo: PromoStall = {
      id,
      stallId,
      promoTitle: promoTitle,
      promoAvatar: promoAvatar,
      promoHtml: promoHtml,
      promoLinks: dto.promoLinks ?? [],
      series: dto.series ?? [],
      tags: dto.tags ?? [],
      customTags: dto.customTags,
    };

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

  // FB 宣傳車，手動將 width, height 加到 style 上
  private _preserveSizeAttributes(html: string) {
    // 建立 DOM 方便取屬性
    const temp = document.createElement('div');
    temp.innerHTML = html;

    temp.querySelectorAll('iframe').forEach((el: Element) => {
      const width = el.getAttribute('width');
      const height = el.getAttribute('height');

      // 如果有 width / height，就加到 style
      if (width) {
        (el as HTMLIFrameElement).style.width = `100%`;
        el.removeAttribute('width');
      }
      if (height) {
        (el as HTMLIFrameElement).style.height = `${height}px`;
        el.removeAttribute('height');
      }
    });

    return temp.innerHTML;
  }
}
