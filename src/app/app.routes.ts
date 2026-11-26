import { Routes } from '@angular/router';
import { APPS } from './data/apps';
import { RouteMarker } from './os/route-marker';

export const routes: Routes = [
  { path: '', component: RouteMarker, pathMatch: 'full' },
  ...APPS.map((app) => ({ path: app.route, component: RouteMarker, data: { app: app.id } })),
  { path: '**', redirectTo: '' },
];
