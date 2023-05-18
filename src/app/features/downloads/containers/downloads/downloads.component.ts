import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { provideComponentStore } from '@ngrx/component-store';
import { AudioListStoreService } from '../../store';
import { SearchComponent } from '../../presentations';

@Component({
  selector: 'app-downloads',
  standalone: true,
  imports: [CommonModule, IonicModule, SearchComponent],
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
    </ion-content>
  `,
  styles: [],
  providers: [provideComponentStore(AudioListStoreService)],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DownloadsComponent {
  private readonly store: AudioListStoreService = inject(AudioListStoreService);

  protected download(url: string): void {
    this.store.download(url);
  }
}
