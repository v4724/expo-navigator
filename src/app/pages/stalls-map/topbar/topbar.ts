import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { User } from 'src/app/components/user/user';
import { DownloadMap } from 'src/app/components/download-map/download-map';
import { ToggleController } from 'src/app/components/layers-controller/toggle-controller/toggle-controller';
import { MatIcon } from '@angular/material/icon';
import { ExpoStateService } from 'src/app/core/services/state/expo-state-service';
import { toSignal } from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-topbar',
  imports: [CommonModule, User, DownloadMap, MatIcon, ToggleController],
  templateUrl: './topbar.html',
  styleUrl: './topbar.scss',
})
export class Topbar {
  private _expoStateService = inject(ExpoStateService);

  expoTitle = toSignal(this._expoStateService.expoTitle$);
}
