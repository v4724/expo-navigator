import { CommonModule } from '@angular/common';
import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class UiStateService {
  private _showUiState = new BehaviorSubject<boolean>(false);
  showUiState$ = this._showUiState.asObservable();

  isMobile() {
    // Use a media query for a more robust responsive check based on viewport width.
    const isMobile = () => window.matchMedia('(max-width: 768px)').matches;
    const mobileCheck = isMobile(); // Check once and store the result.

    return mobileCheck;
  }
}
