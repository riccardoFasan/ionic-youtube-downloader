import {
  ChangeDetectionStrategy,
  Component,
  inject,
  Signal,
  OnInit,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import {
  AudioComponent,
  DownloadingAudioComponent,
  SearchComponent,
} from '../presentation';
import { Audio, Download } from 'src/app/core/models';
import { AudioListService } from '../services';

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
        <ion-item-group *ngIf="hasDownloads()">
          <ion-item-divider>
            <ion-label> Current downloads </ion-label>
          </ion-item-divider>
          <app-downloading-audio
            *ngFor="let download of downloads()"
            [download]="download"
          ></app-downloading-audio>
        </ion-item-group>
        <ion-item-group *ngIf="hasAudios()">
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
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DownloadsComponent {
  private readonly downloader: AudioListService = inject(AudioListService);

  protected readonly downloads: Signal<Download[]> = this.downloader.downloads;
  protected readonly audios: Signal<Audio[]> = this.downloader.audios;
  protected readonly hasDownloads: Signal<boolean> =
    this.downloader.hasDownloads;
  protected readonly hasAudios: Signal<boolean> = this.downloader.hasAudios;

  protected download(url: string): void {
    this.downloader.download(url);
  }

  protected onRemove(audio: Audio): void {
    this.downloader.askToRemoveAudio(audio);
  }
}
