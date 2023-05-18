import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule, ToastController } from '@ionic/angular';
import { DownloaderService } from 'src/app/core/services';
import { VideoInfo } from 'src/app/core/models';
import {
  BehaviorSubject,
  Observable,
  defer,
  forkJoin,
  map,
  switchMap,
} from 'rxjs';
import { Filesystem, Directory } from '@capacitor/filesystem';
import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { FileOpener } from '@capacitor-community/file-opener';

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
  private readonly toastController: ToastController = inject(ToastController);

  protected readonly loading$: BehaviorSubject<boolean> =
    new BehaviorSubject<boolean>(false);

  protected readonly form: FormGroup = new FormGroup({
    search: new FormControl('', [Validators.required]),
  });

  protected download(): void {
    const url: string = this.form.get('search')?.value;
    this.loading$.next(true);
    this.downloadFile(url)
      .pipe(switchMap((file: File) => defer(() => this.saveFile(file))))
      .subscribe({
        next: async (fileUri: string) => {
          this.presentToast(
            'Video downloaded, converted and saved successfully!',
            'success'
          );
          this.loading$.next(false);
          try {
            await FileOpener.open({
              filePath: fileUri,
              contentType: 'audio/mp3',
              openWithDefault: true,
            });
          } catch (e) {
            console.log(e);
          }
        },
        error: () => {
          this.presentToast('Error retrieving the video.', 'danger');
          this.loading$.next(false);
        },
      });
  }

  private downloadFile(url: string): Observable<File> {
    return forkJoin([
      this.downloader.getInfo(url),
      this.downloader.download(url),
    ]).pipe(
      map(([info, blob]: [VideoInfo, Blob]) => {
        return new File([blob], `${info.title}.mp3`, {
          type: 'audio/mp3',
        });
      })
    );
  }

  private async saveFile(file: File): Promise<string> {
    function toBase64(file: File): Promise<string> {
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = reject;
      });
    }

    const { uri } = await Filesystem.writeFile({
      path: file.name,
      data: await toBase64(file),
      directory: Directory.Library,
      recursive: true,
    });

    console.log(uri);

    return uri;
  }

  private async presentToast(
    message: string,
    color: 'danger' | 'success'
  ): Promise<void> {
    const toast = await this.toastController.create({
      message,
      color,
      duration: 1500,
      position: 'bottom',
    });
    toast.present();
  }
}
