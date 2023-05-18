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
      <ion-img [src]="download.info?.thumbnailUrl"> </ion-img>
      {{ download.info?.title }}
    </ion-item>
  `,
  styles: [],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DownloadingAudioComponent {
  @Input({ required: true }) download!: Download;
}
