import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Download } from 'src/app/core/models';
import { IonicModule } from '@ionic/angular';

@Component({
  selector: 'app-downloading-audio',
  standalone: true,
  imports: [CommonModule, IonicModule],
  template: `
    <ion-item>
      <ng-container *ngIf="download.info; else noInfo">
        <ion-thumbnail slot="start">
          <ion-img
            [alt]="download.info.title"
            [src]="download.info.thumbnailUrl"
          >
          </ion-img>
        </ion-thumbnail>
        <ion-label>
          {{ download.info.title }}
        </ion-label>
      </ng-container>
      <ion-spinner slot="end"></ion-spinner>
      <ng-template #noInfo>
        <ion-thumbnail slot="start">
          <ion-skeleton-text [animated]="true"></ion-skeleton-text>
        </ion-thumbnail>
        <ion-label>
          <ion-skeleton-text
            [animated]="true"
            style="width: 85%;"
          ></ion-skeleton-text>
          <ion-skeleton-text
            [animated]="true"
            style="width: 75%;"
          ></ion-skeleton-text>
        </ion-label>
      </ng-template>
    </ion-item>
  `,
  styles: [],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DownloadingAudioComponent {
  @Input({ required: true }) download!: Download;
}
