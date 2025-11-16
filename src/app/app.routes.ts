import { Routes } from '@angular/router';
import { GridHelper } from './pages/grid-helper/grid-helper';
import { isPlatform } from '@ionic/core';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () =>
      isMobileDevice()
        ? import('./device/mobile/home/home').then((m) => m.Home)
        : import('./layout/layout').then((m) => m.Layout),
  },
  { path: 'grid-helper', component: GridHelper },
];

function isMobileDevice() {
  const isMobilePlatform = typeof window !== 'undefined' && isPlatform('mobile');
  let isMobileWidth = false;
  const isMobileSize = isMobileWidth || isMobilePlatform;

  return isMobileSize;
}
