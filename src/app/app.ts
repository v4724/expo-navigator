import { CommonModule } from '@angular/common';
import { Component, HostListener, inject, OnInit, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { SwUpdate } from '@angular/service-worker';
import { IonApp, IonRouterOutlet } from '@ionic/angular/standalone';
import { isPlatform } from '@ionic/core';
import { ButtonModule } from 'primeng/button';
import { ConfirmDialog } from 'primeng/confirmdialog';
import { Toast } from 'primeng/toast';
import { UiStateService } from './core/services/state/ui-state-service';

@Component({
  selector: 'app-root',
  imports: [
    CommonModule,
    RouterOutlet,
    IonApp,
    IonRouterOutlet,
    ConfirmDialog,
    Toast,
    ButtonModule,
  ],
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App implements OnInit {
  protected readonly title = signal('expo-navigator');

  isMobileSize = signal<boolean>(true);

  private _swUpdate = inject(SwUpdate);
  private _uiStateService = inject(UiStateService);

  ngOnInit() {
    this.loadAppropriateComponent();

    // 檢查 SwUpdate 是否啟用 (Production 環境下)
    if (this._swUpdate.isEnabled) {
      // 1. 監聽 'versionUpdates' 事件 (新版 Angular)
      this._swUpdate.versionUpdates.subscribe((evt) => {
        // 發現新的版本
        if (evt.type === 'VERSION_READY') {
          console.log(`發現新版本: ${evt.latestVersion.hash}`);
          this._uiStateService.versionReady = true;
        }
      });
    }
  }

  loadAppropriateComponent() {
    // const isMobileWidth = window?.innerWidth <= 425;
    const isMobileWidth = false;
    const isMobilePlatform = typeof window !== 'undefined' && isPlatform('mobile');
    const isMobile = isMobileWidth || isMobilePlatform;
    this.isMobileSize.set(isMobile);
  }

  @HostListener('window:resize') onResize() {
    this.loadAppropriateComponent();
  }
}
