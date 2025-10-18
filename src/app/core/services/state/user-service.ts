import { inject, Injectable } from '@angular/core';
import { BehaviorSubject, catchError, EMPTY, tap } from 'rxjs';
import { User } from '../../interfaces/user.interface';
import { UserApiService } from '../api/user-api.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MarkedStallService } from './marked-stall-service';

@Injectable({
  providedIn: 'root',
})
export class UserService {
  private readonly _snackBar = inject(MatSnackBar);
  private _userApiService = inject(UserApiService);
  private _markedStallService = inject(MarkedStallService);

  private _user = new BehaviorSubject<User | null>(null);
  private _isLogin = new BehaviorSubject<boolean>(false);

  user$ = this._user.asObservable();
  isLogin$ = this._isLogin.asObservable();

  constructor() {}

  get user() {
    return this._user.getValue();
  }

  login(acc: string) {
    return this._userApiService.login(acc).pipe(
      catchError((err) => {
        this._snackBar.open('使用者建立失敗', '伺服器錯誤', { duration: 2000 });
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
    );
  }

  logout() {
    this._isLogin.next(false);
    this._user.next(null);
  }

  update(user: User) {
    this._user.next(user);
  }
}
