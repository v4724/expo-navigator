import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export interface UserDto {
  acc: string;
  isStallOwner: boolean;
  stallIds: string[];
}

@Injectable({
  providedIn: 'root',
})
export class UserService {
  private _user = new BehaviorSubject<UserDto | null>(null);
  private _isLogin = new BehaviorSubject<boolean>(false);

  user$ = this._user.asObservable();
  isLogin$ = this._isLogin.asObservable();

  constructor() {}

  login(acc: string) {
    setTimeout(() => {
      this._isLogin.next(true);
      this._user.next({ acc, isStallOwner: true, stallIds: ['O02', 'O03'] });
    }, 500);
  }

  logout() {
    this._isLogin.next(false);
    this._user.next(null);
  }
}
