import { Routes } from '@angular/router';
import { StallsMap } from './pages/stalls-map/stalls-map';
import { Layout } from './layout/layout';
import { GridHelper } from './pages/grid-helper/grid-helper';

export const routes: Routes = [
  { path: '', component: Layout, children: [{ path: '', component: StallsMap }] },
  { path: 'grid-helper', component: GridHelper },
];
