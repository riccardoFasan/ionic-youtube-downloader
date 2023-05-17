import { Routes } from '@angular/router';

export const APP_ROUTES: Routes = [
  {
    path: 'downlaods',
    loadChildren: () =>
      import('./features/downloads/downloads.routes').then(
        (m) => m.DOWNLOADS_ROUTES
      ),
  },
  {
    path: '',
    redirectTo: 'downlaods',
    pathMatch: 'full',
  },
];
