import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { tap, map } from 'rxjs/operators';
import { FetchResponse, Response, UpdateResponse } from '../../models/update-response.model';
import { StallDto, UpdateStallDto, UpdateStallDtoWithPromo } from '../../models/stall.model';
import { env } from '@env/env'; // 根據實際路徑調整

@Injectable({
  providedIn: 'root',
})
export class StallApiService {
  private apiUrl = env.apiUrl;

  constructor(private http: HttpClient) {}

  fetch(): Observable<StallDto[]> {
    return this.http
      .get<
        FetchResponse<StallDto[]>
      >(`${this.apiUrl}/api/stalls`, { params: { timestamp: +new Date() } })
      .pipe(map((res) => res.data));
  }

  fetchById(id: string): Observable<StallDto> {
    return this.http
      .get<
        FetchResponse<StallDto>
      >(`${this.apiUrl}/api/stall/${id}`, { params: { timestamp: +new Date() } })
      .pipe(map((res) => res.data));
  }

  update(id: string, dto: UpdateStallDto): Observable<Response> {
    return this.http
      .put<Response>(`${this.apiUrl}/api/stall/${id}`, dto)
      .pipe(tap((res) => console.debug(res)));
  }

  updateStallwithPromo(
    id: string,
    dto: UpdateStallDtoWithPromo,
  ): Observable<UpdateResponse<StallDto>> {
    return this.http
      .put<UpdateResponse<StallDto>>(`${this.apiUrl}/api/stallWithPromo/${id}`, dto)
      .pipe(tap((res) => console.debug(res)));
  }

  // transformDtoToStall(dto: UserDto): User {
  //   return {
  //     id: dto.id,
  //     acc: dto.acc,
  //     isStallOwner: dto.isStallOwner,
  //     stallIds: dto.stallIds,
  //   };
  // }

  // transformToDto(data: StallData): UpdateStallDto {
  //   const dto = { ...data };
  //   delete dto.id;

  //   return dto;
  // }
}
