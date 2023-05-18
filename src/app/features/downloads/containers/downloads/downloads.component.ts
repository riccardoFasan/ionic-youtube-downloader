import {
  ChangeDetectionStrategy,
  Component,
  inject,
  Signal,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { provideComponentStore } from '@ngrx/component-store';
import { AudioListStoreService } from '../../store';
import {
  DownloadingAudioComponent,
  SearchComponent,
} from '../../presentations';
import { Download } from 'src/app/core/models';

@Component({
  selector: 'app-downloads',
  standalone: true,
  imports: [
    CommonModule,
    IonicModule,
    SearchComponent,
    DownloadingAudioComponent,
  ],
  template: `
    <ion-header class="ion-no-border" [translucent]="true">
      <ion-toolbar>
        <ion-title>Downloader</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content class="ion-padding" [fullscreen]="true">
      <ion-header collapse="condense" class="mb-4">
        <ion-toolbar>
          <ion-title size="large">Downloader</ion-title>
        </ion-toolbar>
      </ion-header>

      <app-search (search)="download($event)"></app-search>

      <ion-list>
        <ion-item-group *ngIf="downloads().length">
          <ion-item-divider>
            <ion-label> Downloads </ion-label>
          </ion-item-divider>
          <app-downloading-audio
            *ngFor="let download of downloads()"
            [download]="download"
          ></app-downloading-audio>
        </ion-item-group>
      </ion-list>
    </ion-content>
  `,
  styles: [],
  providers: [provideComponentStore(AudioListStoreService)],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DownloadsComponent {
  private readonly store: AudioListStoreService = inject(AudioListStoreService);

  protected readonly downloads: Signal<Download[]> = this.store.downloads;

  protected download(url: string): void {
    this.store.download(url);
  }
}
