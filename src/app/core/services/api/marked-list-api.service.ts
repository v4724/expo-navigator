import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { tap, map } from 'rxjs/operators';
import { CreateResponse, Response } from '../../models/update-response.model';
import { MarkedListCreateDto, MarkedListUpdateDto } from '../../models/marked-stall.model';

@Injectable({
  providedIn: 'root',
})
export class MarkedListApiService {
  private apiUrl = 'https://expo-navigator-worker.v47244724.workers.dev'; // 根據實際 API 路徑調整

  constructor(private http: HttpClient) {}

  create(dto: MarkedListCreateDto): Observable<CreateResponse> {
    return this.http
      .post<CreateResponse>(`${this.apiUrl}/api/markedList`, dto)
      .pipe(tap((res) => console.log(res)));
  }

  update(id: number, dto: MarkedListUpdateDto): Observable<Response> {
    return this.http
      .put<Response>(`${this.apiUrl}/api/markedList/${id}`, dto)
      .pipe(tap((res) => console.log(res)));
  }

  delete(id: number): Observable<Response> {
    return this.http
      .delete<Response>(`${this.apiUrl}/api/markedList/${id}`)
      .pipe(tap((res) => console.log(res)));
  }

  // transformDtoToUser(dto: MarkedListDto): MarkedList {
  //   return {
  //     id: dto.id,
  //     acc: dto.acc,
  //     isStallOwner: dto.isStallOwner,
  //     stallIds: dto.stallIds,
  //   };
  // }

  // transformToDto(user: MarkedList): MarkedListDto {
  //   return {
  //     id: user.id,
  //     acc: user.acc,
  //     isStallOwner: user.isStallOwner,
  //     stallIds: user.stallIds,
  //   };
  // }
}
