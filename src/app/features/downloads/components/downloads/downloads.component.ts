import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule, ToastController } from '@ionic/angular';
import { DownloaderService, FilesystemService } from 'src/app/core/services';
import { BehaviorSubject, Observable, defer, forkJoin, switchMap } from 'rxjs';
import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { Audio, AudioInfo } from 'src/app/core/models';

@Component({
  selector: 'app-downloads',
  standalone: true,
  imports: [CommonModule, IonicModule, ReactiveFormsModule],
  template: `
    <ion-header class="ion-no-border" [translucent]="true">
      <ion-toolbar fixed-buttons>
        <ion-title>Downloader</ion-title>
      </ion-toolbar>
      <ion-progress-bar
        *ngIf="loading$ | async"
        type="indeterminate"
      ></ion-progress-bar>
    </ion-header>

    <ion-content class="ion-padding" [fullscreen]="true">
      <ion-header collapse="condense" class="mb-4">
        <ion-toolbar>
          <ion-title size="large">Downloader</ion-title>
        </ion-toolbar>
      </ion-header>

      <form [formGroup]="form">
        <ion-input
          formControlName="search"
          [disabled]="!!(loading$ | async)"
          label="Youtube URL"
          label-placement="floating"
          fill="solid"
          placeholder="Enter text"
        ></ion-input>
        <ion-button
          expand="block"
          type="button"
          [disabled]="(loading$ | async) || form.invalid"
          (click)="download()"
        >
          Download
        </ion-button>
      </form>
    </ion-content>
  `,
  styles: [],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DownloadsComponent {
  private readonly downloader: DownloaderService = inject(DownloaderService);
  private readonly filesystem: FilesystemService = inject(FilesystemService);
  private readonly toastController: ToastController = inject(ToastController);

  protected readonly loading$: BehaviorSubject<boolean> =
    new BehaviorSubject<boolean>(false);

  protected readonly form: FormGroup = new FormGroup({
    search: new FormControl('', [Validators.required]),
  });

  protected download(): void {
    const url: string = this.form.get('search')?.value;
    this.loading$.next(true);
    this.downloadAudio(url).subscribe({
      next: (audio: Audio) => {
        this.presentToast(
          'Video downloaded, converted and saved successfully!',
          'success'
        );
        this.filesystem.openAudio(audio);
        this.loading$.next(false);
      },
      error: () => {
        this.presentToast('Error retrieving the video.', 'danger');
        this.loading$.next(false);
      },
    });
  }

  private downloadAudio(url: string): Observable<Audio> {
    return forkJoin([
      this.downloader.getInfo(url),
      this.downloader.download(url),
    ]).pipe(
      switchMap(([info, arrayBuffer]: [AudioInfo, ArrayBuffer]) =>
        defer(() => this.filesystem.saveAudio(info, arrayBuffer))
      )
    );
  }

  private async presentToast(
    message: string,
    color: 'danger' | 'success'
  ): Promise<void> {
    const toast = await this.toastController.create({
      message,
      color,
      duration: 1500,
      position: 'top',
    });
    toast.present();
  }
}
