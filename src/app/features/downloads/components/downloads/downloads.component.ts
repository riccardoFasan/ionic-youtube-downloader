import { ChangeDetectionStrategy, Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';

@Component({
  selector: 'app-downloads',
  standalone: true,
  imports: [CommonModule, IonicModule],
  template: `
    <ion-header class="ion-no-border" [translucent]="true">
      <ion-toolbar fixed-buttons>
        <ion-title>Downloader</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content [fullscreen]="true">
      <ion-header collapse="condense" class="mb-4">
        <ion-toolbar>
          <ion-title size="large">Downloader</ion-title>
        </ion-toolbar>
      </ion-header>
    </ion-content>
  `,
  styles: [],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DownloadsComponent {}
