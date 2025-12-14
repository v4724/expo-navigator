import { inject, Injectable } from '@angular/core';
import { BehaviorSubject, catchError, EMPTY, tap } from 'rxjs';
import { User } from '../../interfaces/user.interface';
import { UserApiService } from '../api/user-api.service';
import { MarkedStallService } from './marked-stall-service';
import { UiStateService } from './ui-state-service';
import { MessageService } from 'primeng/api';

@Injectable({
  providedIn: 'root',
})
export class UserService {
  private readonly _messageService = inject(MessageService);
  private _userApiService = inject(UserApiService);
  private _markedStallService = inject(MarkedStallService);
  private _uiStateService = inject(UiStateService);

  private _user = new BehaviorSubject<User | null>(null);
  private _isLogin = new BehaviorSubject<boolean>(false);

  user$ = this._user.asObservable();
  isLogin$ = this._isLogin.asObservable();

  constructor() {
    this.initUser();
  }

  private initUser() {
    // 只在瀏覽器環境操作 localStorage
    if (this._uiStateService.isPlatformBrowser()) {
      const userStr = localStorage.getItem('user');
      if (userStr) {
        try {
          const user = JSON.parse(userStr) as User;
          if (user) {
            this.login(user.acc).subscribe();
          }
        } catch (e) {
          console.error('Failed to parse user from localStorage', e);
        }
      }
    }
  }

  get user() {
    return this._user.getValue();
  }

  get isLogin() {
    return this._isLogin.getValue();
  }

  login(acc: string) {
    return this._userApiService.login(acc).pipe(
      catchError((err) => {
        this._messageService.add({
          severity: 'custom',
          summary: `登入失敗 伺服器錯誤`,
          sticky: true,
          closable: true,
          data: {
            type: 'warning',
          },
        });
        console.error(err);
        return EMPTY;
      }),
      tap((res) => {
        if (!res.success || res.data === null) {
          return;
        }
        const user = this._userApiService.transformDtoToUser(res.data);
        this._markedStallService.initAfterLogin(res.data.markedList ?? []);

        this._isLogin.next(true);
        this._user.next(user);
      }),
      tap(() => {
        const user = this._user.getValue();
        localStorage.setItem('user', JSON.stringify(user));
      }),
    );
  }

  logout() {
    this._isLogin.next(false);
    this._user.next(null);
    localStorage.removeItem('user');

    this._markedStallService.resetLayerStatus();
  }

  update(user: User) {
    this._user.next(user);
  }
}
