import { Routes } from '@angular/router';
import { StallsMap } from './pages/stalls-map/stalls-map';
import { Layout } from './layout/layout';

export const routes: Routes = [
  { path: '', component: Layout, children: [{ path: '', component: StallsMap }] },
];
