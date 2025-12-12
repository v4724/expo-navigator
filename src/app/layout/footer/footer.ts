import { Component, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ExpoStateService } from 'src/app/core/services/state/expo-state-service';
import { ButtonModule } from 'primeng/button';
import { CommonModule } from '@angular/common';
import { environment } from 'src/env';

@Component({
  selector: 'app-footer',
  imports: [CommonModule, ButtonModule],
  templateUrl: './footer.html',
  styleUrl: './footer.scss',
})
export class Footer {
  private _expoStateService = inject(ExpoStateService);

  expoTitle = toSignal(this._expoStateService.expoTitle$);
  expoUrl = toSignal(this._expoStateService.expoUrl$);
  reportUrl = toSignal(this._expoStateService.reportUrl$);

  appVersion = environment.version;

  openUrl(url: string | undefined) {
    if (url) {
      window.open(url, '_blank');
    }
  }
}
