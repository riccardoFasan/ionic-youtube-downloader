import {
  Injectable,
  Signal,
  signal,
  inject,
  effect,
  EffectRef,
  computed,
  WritableSignal,
} from '@angular/core';
import {
  Observable,
  catchError,
  defer,
  forkJoin,
  lastValueFrom,
  switchMap,
  tap,
  throwError,
} from 'rxjs';
import { Audio, AudioInfo, Download } from 'src/app/core/models';
import {
  FilesystemService,
  MessagerService,
  StorageService,
  YtdlpService,
  AskerService,
} from 'src/app/core/services';

@Injectable({
  providedIn: 'root',
})
export class DownloadsService {
  private readonly ytdlp: YtdlpService = inject(YtdlpService);
  private readonly filesystem: FilesystemService = inject(FilesystemService);
  private readonly storage: StorageService = inject(StorageService);
  private readonly messager: MessagerService = inject(MessagerService);
  private readonly asker: AskerService = inject(AskerService);

  readonly downloads: WritableSignal<Download[]> = signal<Audio[]>([]);
  readonly audios: WritableSignal<Audio[]> = signal<Audio[]>([]);
  readonly hasDownloads: Signal<boolean> = computed<boolean>(
    () => this.downloads().length > 0
  );
  readonly hasAudios: Signal<boolean> = computed<boolean>(
    () => this.audios().length > 0
  );

  private readonly syncStorage: EffectRef = effect(() => {
    this.storage.setAudios(this.audios());
  });

  constructor() {
    this.loadAudios();
    this.syncStorage;
  }

  async download(url: string): Promise<void> {
    const downloading: boolean = this.downloads().some(
      (download: Download) => download.url === url
    );
    if (downloading) {
      this.messager.duplicateWarning();
      return;
    }

    this.addDownload({ url });

    const download$: Observable<Audio> = this.downloadAudio(url).pipe(
      switchMap(([info, arrayBuffer]: [AudioInfo, ArrayBuffer]) =>
        this.saveAudio(info, arrayBuffer)
      ),
      tap({
        next: (audio: Audio) => {
          this.removeDownload({ url: audio.url });
          this.addAudio(audio);
        },
        error: (url: string) => {
          this.messager.downloadError(url);
          this.removeDownload({ url });
        },
      })
    );

    await lastValueFrom(download$);
  }

  async askToRemoveAudio(audio: Audio): Promise<void> {
    const canRemove: boolean = await this.asker.askToRemoveFile();
    if (canRemove) this.removeAudio(audio);
  }

  private updateAudios(audios: Audio[]): void {
    this.audios.set(audios);
  }

  private addDownload(download: Download): void {
    this.downloads.update((downloads: Download[]) => [...downloads, download]);
  }

  private removeDownload(download: Download): void {
    const url: string = download.url;
    this.downloads.update((downloads: Download[]) =>
      downloads.filter((download: Download) => download.url !== url)
    );
  }

  private setDownloadAudioInfo(info: AudioInfo): void {
    this.downloads.update((downloads: Download[]) =>
      downloads.map((download: Download) =>
        download.url === info.url ? { ...download, info } : download
      )
    );
  }

  private async loadAudios(): Promise<void> {
    const audios: Audio[] = await this.storage.getAudios();
    this.updateAudios(audios);
  }

  private addAudio(audio: Audio): void {
    this.audios.update((audios: Audio[]) => [...audios, audio]);
  }

  private removeAudio(audio: Audio): void {
    this.audios.update((audios: Audio[]) =>
      audios.filter((a: Audio) => a.url !== audio.url)
    );
  }

  private downloadAudio(url: string): Observable<[AudioInfo, ArrayBuffer]> {
    return forkJoin([this.getInfo(url), this.ytdlp.download(url)]).pipe(
      catchError(() => throwError(() => url))
    );
  }

  private getInfo(url: string): Observable<AudioInfo> {
    return this.ytdlp
      .getInfo(url)
      .pipe(tap((info: AudioInfo) => this.setDownloadAudioInfo(info)));
  }

  private saveAudio(
    info: AudioInfo,
    arrayBuffer: ArrayBuffer
  ): Observable<Audio> {
    return defer(() => this.filesystem.saveAudioFile(info, arrayBuffer)).pipe(
      catchError(() => throwError(() => info.url))
    );
  }
}
