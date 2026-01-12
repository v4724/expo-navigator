import { Component, inject, OnInit } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ExpoStateService } from 'src/app/core/services/state/expo-state-service';
import { ButtonModule } from 'primeng/button';
import { CommonModule } from '@angular/common';
import packageJson from '../../../../package.json';
import { UiStateService } from 'src/app/core/services/state/ui-state-service';

@Component({
  selector: 'app-footer',
  imports: [CommonModule, ButtonModule],
  templateUrl: './footer.html',
  styleUrl: './footer.scss',
})
export class Footer implements OnInit {
  private _expoStateService = inject(ExpoStateService);
  private _uiStateService = inject(UiStateService);

  expoTitle = toSignal(this._expoStateService.expoTitle$);
  expoUrl = toSignal(this._expoStateService.expoUrl$);
  reportUrl = toSignal(this._expoStateService.reportUrl$);

  appVersion: string = 'x.x.x';

  ngOnInit(): void {
    this.appVersion = packageJson.version;
  }

  openUrl(url: string | undefined) {
    if (url) {
      window.open(url, '_blank');
    }
  }
}
