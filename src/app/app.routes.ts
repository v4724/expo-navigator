import { Routes } from '@angular/router';
import { isPlatform } from '@ionic/core';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () =>
      isMobileDevice()
        ? import('./device/mobile/home/home').then((m) => m.Home)
        : import('./layout/layout').then((m) => m.Layout),
  },
  {
    path: 'grid-helper',
    loadComponent: () => import('./pages/grid-helper/grid-helper').then((m) => m.GridHelper),
  },
  {
    path: 'mobile-search',
    loadComponent: () => import('./device/mobile/pages/search/search').then((m) => m.Search),
  },
  {
    path: 'mobile-edit-marked-list',
    loadComponent: () =>
      import('./device/mobile/pages/edit-marked-list/edit-marked-list').then(
        (m) => m.EditMarkedList,
      ),
  },
];

function isMobileDevice() {
  const isMobilePlatform = typeof window !== 'undefined' && isPlatform('mobile');
  let isMobileWidth = false;
  const isMobileSize = isMobileWidth || isMobilePlatform;

  return isMobileSize;
}
