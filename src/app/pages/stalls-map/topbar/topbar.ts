import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { User } from 'src/app/components/user/user';
import { DownloadMap } from 'src/app/components/download-map/download-map';
import { toSignal } from '@angular/core/rxjs-interop';
import { InputSearch } from 'src/app/components/search-and-filter/input-search/input-search';
import { ResultListBtn } from 'src/app/components/search-and-filter/result-list-btn/result-list-btn';
import { UserService } from 'src/app/core/services/state/user-service';
import { MarkedListBtn } from 'src/app/shared/components/marked-list/marked-list-btn';

@Component({
  selector: 'app-topbar',
  imports: [CommonModule, User, DownloadMap, InputSearch, ResultListBtn, MarkedListBtn],
  templateUrl: './topbar.html',
  styleUrl: './topbar.scss',
})
export class Topbar {
  private _userService = inject(UserService);

  isLogin = toSignal(this._userService.isLogin$);
}
