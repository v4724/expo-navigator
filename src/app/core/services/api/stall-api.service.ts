import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { tap, map } from 'rxjs/operators';
import { FetchResponse, Response } from '../../models/update-response.model';
import { StallDto, UpdateStallDto } from '../../models/stall.model';

@Injectable({
  providedIn: 'root',
})
export class StallApiService {
  private apiUrl = 'https://expo-navigator-worker.v47244724.workers.dev'; // 根據實際 API 路徑調整

  constructor(private http: HttpClient) {}

  fetch(): Observable<StallDto[]> {
    return this.http.get<FetchResponse<StallDto[]>>(`${this.apiUrl}/api/stalls`).pipe(
      tap((res) => console.log(res)),
      map((res) => res.data),
    );
  }

  update(id: string, dto: UpdateStallDto): Observable<Response> {
    return this.http
      .put<Response>(`${this.apiUrl}/api/stalls/${id}`, dto)
      .pipe(tap((res) => console.log(res)));
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
