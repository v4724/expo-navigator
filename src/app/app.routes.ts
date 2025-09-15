import { Routes } from '@angular/router';
import { Main } from './layout/main/main';
import { StallsMap } from './pages/stalls-map/stalls-map';

export const routes: Routes = [
  { path: '', component: Main, children: [{ path: '', component: StallsMap }] },
];
