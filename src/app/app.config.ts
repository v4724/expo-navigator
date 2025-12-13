import {
  ApplicationConfig,
  inject,
  provideBrowserGlobalErrorListeners,
  provideEnvironmentInitializer,
  provideZonelessChangeDetection,
  isDevMode,
} from '@angular/core';
import { provideRouter } from '@angular/router';

import { routes } from './app.routes';
import { provideClientHydration, withEventReplay } from '@angular/platform-browser';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { providePrimeNG } from 'primeng/config';
import { definePreset } from '@primeuix/themes';
import Aura from '@primeuix/themes/aura';
import { provideHttpClient } from '@angular/common/http';
import { MatIconRegistry } from '@angular/material/icon';

import { provideIonicAngular } from '@ionic/angular/standalone';
import { DialogService } from 'primeng/dynamicdialog';
import { ConfirmationService, MessageService } from 'primeng/api';
import { provideServiceWorker } from '@angular/service-worker';

const MyPreset = definePreset(Aura, {
  semantic: {
    colorScheme: {
      light: {
        primary: {
          50: '{slate.50}',
          100: '{slate.200}',
          200: '{slate.400}',
          300: '{slate.500}',
          400: '{slate.600}',
          500: '{slate.700}',
          600: '{slate.700}',
          700: '{slate.700}',
          800: '{slate.700}',
          900: '{slate.700}',
          950: '{slate.700}',
        },
      },
      dark: {
        //...
      },
    },
  },
  components: {
    dialog: {
      root: {},
    },
  },
});

export const appConfig: ApplicationConfig = {
  providers: [
    provideIonicAngular(), // 初始化 Ionic
    provideHttpClient(),
    provideAnimationsAsync(),
    providePrimeNG({
      theme: {
        preset: MyPreset,
      },
    }),
    provideBrowserGlobalErrorListeners(),
    provideZonelessChangeDetection(),
    provideRouter(routes),
    // provideClientHydration(withEventReplay()), 造成 constructor 內的 (API stalls) 比 F12 DevTools 開始監控更早，導致 Prefetch 且不會出現在 F12 Network 上
    provideEnvironmentInitializer(() => {
      const matIconRegistry = inject(MatIconRegistry);
      // 設定預設字體集
      matIconRegistry.setDefaultFontSetClass(
        'material-icons',
        // 'material-icons-rounded',
        // 'material-icons-sharp',
        // 'material-icons-outlined',
        // 'material-symbols',
        // 'material-symbols-rounded',
        // 'material-symbols-sharp',
        // 'material-symbols-outlined',
        'mat-ligature-font',
      );
    }),
    DialogService,
    ConfirmationService,
    MessageService,
    provideServiceWorker('ngsw-worker.js', {
      enabled: !isDevMode(),
      registrationStrategy: 'registerWhenStable:30000',
    }),
  ],
};
