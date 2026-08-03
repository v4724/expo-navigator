import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { tap, map } from 'rxjs/operators';
import { CreateResponse, Response } from '../../models/update-response.model';
import { MarkedListCreateDto, MarkedListUpdateDto } from '../../models/marked-stall.model';
import { MarkedList } from '../../interfaces/marked-stall.interface';
import { env } from '@env/env'; // 根據實際路徑調整

@Injectable({
  providedIn: 'root',
})
export class MarkedListApiService {
  private apiUrl = env.apiUrl;

  constructor(private http: HttpClient) {}

  create(acc: string, dto: MarkedListCreateDto): Observable<CreateResponse> {
    return this.http
      .post<CreateResponse>(`${this.apiUrl}api/markedList`, { acc, create: dto })
      .pipe(tap((res) => console.debug(res)));
  }

  update(id: number, acc: string, dto: MarkedListUpdateDto): Observable<Response> {
    return this.http
      .put<Response>(`${this.apiUrl}api/markedList/${id}`, { acc, update: dto })
      .pipe(tap((res) => console.debug(res)));
  }

  delete(id: number, acc: string): Observable<Response> {
    return this.http
      .delete<Response>(`${this.apiUrl}api/markedList/${id}`, { body: { acc } })
      .pipe(tap((res) => console.debug(res)));
  }

  updateShowPath(id: number, acc: string, isPathVisible: boolean): Observable<Response> {
    return this.http
      .put<Response>(`${this.apiUrl}api/markedList/${id}/path-visibility`, {
        acc,
        isPathVisible,
      })
      .pipe(tap((res) => console.debug(res)));
  }

  // transformDtoToUser(dto: MarkedListDto): MarkedList {
  //   return {
  //     id: dto.id,
  //     acc: dto.acc,
  //     isStallOwner: dto.isStallOwner,
  //     stallIds: dto.stallIds,
  //   };
  // }

  transformToDto(orig: MarkedList): MarkedListUpdateDto {
    const { show, isUpdating, list: list, ...data } = orig;

    const dto = {
      ...data,
      list: orig.list.map((info) => {
        return { stallId: info.stall.id, note: info.note };
      }),
    };

    return dto;
  }
}
