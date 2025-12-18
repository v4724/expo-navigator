import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { tap, map } from 'rxjs/operators';
import { CreateResponse, FetchResponse, UpdateResponse } from '../../models/update-response.model';
import { UpdateUserDto, UserDto } from '../../models/user.model';
import { User } from '../../interfaces/user.interface';
import { env } from '@env/env'; // 根據實際路徑調整

@Injectable({
  providedIn: 'root',
})
export class UserApiService {
  private apiUrl = env.apiUrl;

  constructor(private http: HttpClient) {}

  login(acc: string): Observable<FetchResponse<UserDto>> {
    return this.http
      .get<
        FetchResponse<UserDto>
      >(`${this.apiUrl}/api/user/${acc}`, { params: { timestamp: +new Date() } })
      .pipe(tap((res) => console.debug(res)));
  }

  create(user: UserDto): Observable<CreateResponse> {
    return this.http
      .post<CreateResponse>(`${this.apiUrl}/api/user`, user)
      .pipe(tap((res) => console.debug(res)));
  }

  update(id: number, user: UserDto): Observable<UpdateResponse<UserDto>> {
    return this.http
      .put<UpdateResponse<UserDto>>(`${this.apiUrl}/api/user/${id}`, user)
      .pipe(tap((res) => console.debug(res)));
  }

  delete(id: number, acc: string): Observable<UpdateResponse<UserDto>> {
    return this.http
      .delete<
        UpdateResponse<UserDto>
      >(`${this.apiUrl}/api/user/${id}`, { body: { acc: acc.toString() } })
      .pipe(tap((res) => console.debug(res)));
  }

  transformDtoToUser(dto: UserDto): User {
    return {
      id: dto.id,
      acc: dto.acc,
      isStallOwner: dto.isStallOwner,
      stallIds: dto.stallIds,
    };
  }

  transformToDto(user: User): UpdateUserDto {
    return {
      id: user.id,
      acc: user.acc,
      isStallOwner: user.isStallOwner,
      stallIds: user.stallIds,
    };
  }
}
