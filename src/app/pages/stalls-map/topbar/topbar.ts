import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { User } from 'src/app/components/user/user';
import { DownloadMap } from 'src/app/components/download-map/download-map';
import { MatIcon } from '@angular/material/icon';
import { ExpoStateService } from 'src/app/core/services/state/expo-state-service';
import { toSignal } from '@angular/core/rxjs-interop';
import { InputSearch } from 'src/app/components/search-and-filter/input-search/input-search';
import { ResultListBtn } from 'src/app/components/search-and-filter/result-list-btn/result-list-btn';
import { UserService } from 'src/app/core/services/state/user-service';
import { MarkedListBtn } from 'src/app/shared/components/marked-list/marked-list-btn';

@Component({
  selector: 'app-topbar',
  imports: [CommonModule, User, DownloadMap, MatIcon, InputSearch, ResultListBtn, MarkedListBtn],
  templateUrl: './topbar.html',
  styleUrl: './topbar.scss',
})
export class Topbar {
  private _expoStateService = inject(ExpoStateService);
  private _userService = inject(UserService);

  expoTitle = toSignal(this._expoStateService.expoTitle$);
  isLogin = toSignal(this._userService.isLogin$);
}
