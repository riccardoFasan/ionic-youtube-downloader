import { Component, ChangeDetectionStrategy } from '@angular/core';
import { IonicModule } from '@ionic/angular';

@Component({
  selector: 'app-root',
  template: `
    <ion-app>
      <ion-router-outlet></ion-router-outlet>
    </ion-app>
  `,
  styles: [``],
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [IonicModule],
})
export class AppComponent {}
