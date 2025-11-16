import { Routes } from '@angular/router';
import { GridHelper } from './pages/grid-helper/grid-helper';
import { isPlatform } from '@ionic/core';
import { Search } from './device/mobile/pages/search/search';
import { EditMarkedList } from './device/mobile/pages/edit-marked-list/edit-marked-list';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () =>
      isMobileDevice()
        ? import('./device/mobile/home/home').then((m) => m.Home)
        : import('./layout/layout').then((m) => m.Layout),
  },
  { path: 'grid-helper', component: GridHelper },
  { path: 'mobile-search', component: Search },
  { path: 'mobile-edit-marked-list', component: EditMarkedList },
];

function isMobileDevice() {
  const isMobilePlatform = typeof window !== 'undefined' && isPlatform('mobile');
  let isMobileWidth = false;
  const isMobileSize = isMobileWidth || isMobilePlatform;

  return isMobileSize;
}
