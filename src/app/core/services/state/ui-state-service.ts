import { isPlatformBrowser } from '@angular/common';
import { inject, Inject, Injectable, PLATFORM_ID, signal } from '@angular/core';
import { BehaviorSubject, filter, map } from 'rxjs';
import { isPlatform } from '@ionic/core';
import { NavigationEnd, Router } from '@angular/router';

@Injectable({
  providedIn: 'root',
})
export class UiStateService {
  private _showUiState = new BehaviorSubject<boolean>(false);
  private _currUrl = new BehaviorSubject<string>('');
  private _markedListDrawerShown = new BehaviorSubject<boolean>(false);

  showUiState$ = this._showUiState.asObservable();
  currUrl$ = this._currUrl.asObservable();
  isAtRoutingPage$ = this.currUrl$.pipe(
    map((url) => {
      return url.includes('routing');
    }),
  );
  markedListDrawerShown$ = this._markedListDrawerShown.asObservable();

  // 避免 SSR 錯誤
  private platformId = inject(PLATFORM_ID);
  private _router = inject(Router);

  constructor() {
    this._router.events
      .pipe(filter((event): event is NavigationEnd => event instanceof NavigationEnd))
      .subscribe((event: NavigationEnd) => {
        // 更新當前 URL (包含 queryParams/fragment)
        this._currUrl.next(event.urlAfterRedirects);
      });
  }

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

  isMobile() {
    if (this.isPlatformBrowser()) {
      return isPlatform('mobile');
    }
    return false;
  }

  zoomFactor() {
    return this.isSmallScreen() ? 4.5 : 1.8;
  }

  markedListDrawerShown() {}
}
