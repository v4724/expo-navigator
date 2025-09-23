import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Inject, Injectable, PLATFORM_ID } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class UiStateService {
  private _showUiState = new BehaviorSubject<boolean>(false);
  showUiState$ = this._showUiState.asObservable();

  constructor(@Inject(PLATFORM_ID) private platformId: Object) {}

  isPlatformBrowser() {
    return isPlatformBrowser(this.platformId);
  }

  // 裝置寬度較窄
  isSmallScreen() {
    if (this.isPlatformBrowser()) {
      // Use a media query for a more robust responsive check based on viewport width.
      const isSmallScreen = () => window.matchMedia('(max-width: 768px)').matches;
      const mobileCheck = isSmallScreen(); // Check once and store the result.

      return mobileCheck;
    }

    return false;
  }

  zoomFactor() {
    return this.isSmallScreen() ? 4.5 : 1.8;
  }
}
