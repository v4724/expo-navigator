import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { User } from 'src/app/components/user/user';
import { DownloadMap } from 'src/app/components/download-map/download-map';
import { toSignal } from '@angular/core/rxjs-interop';
import { InputSearch } from 'src/app/components/search-and-filter/input-search/input-search';
import { UserService } from 'src/app/core/services/state/user-service';
import { ExpoStateService } from 'src/app/core/services/state/expo-state-service';

@Component({
  selector: 'app-topbar',
  imports: [CommonModule, User, DownloadMap, InputSearch],
  templateUrl: './topbar.html',
  styleUrl: './topbar.scss',
})
export class Topbar {
  private _userService = inject(UserService);
  private _expoStateService = inject(ExpoStateService);

  isLogin = toSignal(this._userService.isLogin$);
  downloadMapSwitch = toSignal(this._expoStateService.downloadMapSwitch$);
}
