import { Routes } from '@angular/router';

export const APP_ROUTES: Routes = [
  {
    path: 'downloads',
    loadChildren: () =>
      import('./features/downloads/downloads.routes').then(
        (m) => m.DOWNLOADS_ROUTES
      ),
  },
  {
    path: '',
    redirectTo: 'downloads',
    pathMatch: 'full',
  },
];
