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
  AudioComponent,
  DownloadingAudioComponent,
  SearchComponent,
} from '../../presentation';
import { Audio, Download } from 'src/app/core/models';

@Component({
  selector: 'app-downloads',
  standalone: true,
  imports: [
    CommonModule,
    IonicModule,
    SearchComponent,
    DownloadingAudioComponent,
    AudioComponent,
  ],
  template: `
    <ion-header class="ion-no-border" [translucent]="true">
      <ion-toolbar>
        <ion-title>Downloader</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content class="ion-padding" [fullscreen]="true">
      <ion-header collapse="condense">
        <ion-toolbar>
          <ion-title size="large">Downloader</ion-title>
        </ion-toolbar>
      </ion-header>

      <app-search (search)="download($event)"></app-search>

      <ion-list>
        <ion-item-group *ngIf="downloads().length">
          <ion-item-divider>
            <ion-label> Current downloads </ion-label>
          </ion-item-divider>
          <app-downloading-audio
            *ngFor="let download of downloads()"
            [download]="download"
          ></app-downloading-audio>
        </ion-item-group>
        <ion-item-group *ngIf="audios().length">
          <ion-item-divider>
            <ion-label> Your audios </ion-label>
          </ion-item-divider>
          <app-audio
            *ngFor="let audio of audios()"
            [audio]="audio"
            (remove)="onRemove($event)"
          ></app-audio>
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
  protected readonly audios: Signal<Audio[]> = this.store.audios;

  protected download(url: string): void {
    this.store.download(url);
  }

  protected onRemove(audio: Audio): void {
    this.store.removeAudio(audio);
  }
}
