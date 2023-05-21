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
export class AudioListService {
  private readonly ytdlp: YtdlpService = inject(YtdlpService);
  private readonly filesystem: FilesystemService = inject(FilesystemService);
  private readonly storage: StorageService = inject(StorageService);
  private readonly messager: MessagerService = inject(MessagerService);
  private readonly asker: AskerService = inject(AskerService);

  private readonly downloadsStore: WritableSignal<Download[]> = signal<Audio[]>(
    []
  );
  private readonly audiosStore: WritableSignal<Audio[]> = signal<Audio[]>([]);

  readonly downloads: Signal<Download[]> = this.downloadsStore.asReadonly();
  readonly audios: Signal<Audio[]> = this.audiosStore.asReadonly();

  readonly hasDownloads: Signal<boolean> = computed<boolean>(
    () => this.downloadsStore().length > 0
  );
  readonly hasAudios: Signal<boolean> = computed<boolean>(
    () => this.audiosStore().length > 0
  );

  private readonly laod: EffectRef = effect(() => this.loadAudios());

  private readonly sync: EffectRef = effect(() =>
    this.storage.setAudios(this.audiosStore())
  );

  async download(url: string): Promise<void> {
    if (this.isDuplicated(url)) {
      this.messager.duplicateWarning();
      return;
    }
    await lastValueFrom(this.downloadAndSave(url));
  }

  async askToRemoveAudio(audio: Audio): Promise<void> {
    const canRemove: boolean = await this.asker.askToRemoveFile();
    if (canRemove) this.removeAudio(audio);
  }

  private updateAudios(audios: Audio[]): void {
    this.audiosStore.set(audios);
  }

  private addDownload(download: Download): void {
    this.downloadsStore.update((downloads: Download[]) => [
      ...downloads,
      download,
    ]);
  }

  private removeDownload(download: Download): void {
    const url: string = download.url;
    this.downloadsStore.update((downloads: Download[]) =>
      downloads.filter((download: Download) => download.url !== url)
    );
  }

  private setDownloadAudioInfo(info: AudioInfo): void {
    this.downloadsStore.update((downloads: Download[]) =>
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
    this.audiosStore.update((audios: Audio[]) => [...audios, audio]);
  }

  private removeAudio(audio: Audio): void {
    this.audiosStore.update((audios: Audio[]) =>
      audios.filter((a: Audio) => a.url !== audio.url)
    );
  }

  private isDuplicated(url: string): boolean {
    const downloading: boolean = this.downloadsStore().some(
      (download: Download) => download.url === url
    );
    const downloaded: boolean = this.audiosStore().some(
      (audio: Audio) => audio.url === url
    );
    return downloading || downloaded;
  }

  private downloadAndSave(url: string): Observable<Audio> {
    this.addDownload({ url });
    return this.downloadAudio(url).pipe(
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
