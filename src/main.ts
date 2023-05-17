import { bootstrapApplication } from '@angular/platform-browser';
import {
  PreloadAllModules,
  provideRouter,
  withPreloading,
} from '@angular/router';
import { AppComponent } from './app/app.component';
import { APP_ROUTES } from './app/app.routes';
import { IonicModule, IonicRouteStrategy } from '@ionic/angular';

import { RouteReuseStrategy } from '@angular/router';
import { importProvidersFrom } from '@angular/core';
import { HttpClientModule } from '@angular/common/http';

bootstrapApplication(AppComponent, {
  providers: [
    provideRouter(APP_ROUTES, withPreloading(PreloadAllModules)),
    { provide: RouteReuseStrategy, useClass: IonicRouteStrategy },
    importProvidersFrom(IonicModule.forRoot(), HttpClientModule),
  ],
}).catch((err) => console.error(err));
