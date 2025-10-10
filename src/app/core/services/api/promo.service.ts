import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import { PromoStallDto } from '../../models/promo-stall.model';

@Injectable({
  providedIn: 'root',
})
export class PromoService {
  private apiUrl = 'https://expo-navigator-worker.v47244724.workers.dev'; // 根據實際 API 路徑調整

  constructor(private http: HttpClient) {}

  getPromotions(): Observable<PromoStallDto[]> {
    return this.http.get<{ result: { data: PromoStallDto[] } }>(`${this.apiUrl}/api/promos`).pipe(
      tap((res) => console.log(res)),
      // 只回傳 data 陣列
      map((res: { result: { data: PromoStallDto[] } }) => res.result.data),
    );
  }
}
