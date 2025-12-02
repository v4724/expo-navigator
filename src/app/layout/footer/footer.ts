import { Component, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ExpoStateService } from 'src/app/core/services/state/expo-state-service';
import { ButtonModule } from 'primeng/button';
import { CommonModule } from '@angular/common';

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

  openUrl() {
    const url = this.expoUrl();
    if (url) {
      window.open(url, '_blank');
    }
  }
}
