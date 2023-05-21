import { Injectable, Signal, inject } from '@angular/core';
import { ComponentStore, OnStateInit } from '@ngrx/component-store';
import {
  AudioListState,
  INITIAL_AUDIO_LIST_STATE,
} from '../../state/audio.state';
import {
  defer,
  switchMap,
  tap,
  pipe,
  forkJoin,
  Observable,
  catchError,
  throwError,
  filter,
} from 'rxjs';
import {
  FilesystemService,
  MessagerService,
  StorageService,
  YtdlpService,
  AskerService,
} from 'src/app/core/services';
import { Audio, AudioInfo, Download } from 'src/app/core/models';

@Injectable()
export class AudioListStoreService
  extends ComponentStore<AudioListState>
  implements OnStateInit
{
  private readonly ytdlp: YtdlpService = inject(YtdlpService);
  private readonly filesystem: FilesystemService = inject(FilesystemService);
  private readonly storage: StorageService = inject(StorageService);
  private readonly messager: MessagerService = inject(MessagerService);
  private readonly asker: AskerService = inject(AskerService);

  readonly downloads: Signal<Download[]> = this.selectSignal(
    (state) => state.downloads
  );
  readonly audios: Signal<Audio[]> = this.selectSignal((state) => state.audios);

  readonly download = this.effect<string>(
    pipe(
      filter((url: string) => {
        const downloading: boolean = this.downloads().some(
          (download: Download) => download.url === url
        );
        if (downloading) this.messager.duplicateWarning();
        return !downloading;
      }),
      tap((url: string) => this.addDownload({ url })),
      switchMap((url: string) => this.downloadAudio(url)),
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
    )
  );

  readonly removeAudio = this.effect<Audio>(
    pipe(
      switchMap((audio: Audio) =>
        defer(() => this.asker.askToRemoveFile()).pipe(
          filter((shouldRemove: boolean) => shouldRemove),
          tap(() => {
            this.updateAudios(
              this.audios().filter((audio: Audio) => audio.url !== audio.url)
            );
            this.storage.removeAudio(audio);
          })
        )
      )
    )
  );

  private readonly updateAudios = this.updater<Audio[]>(
    (state: AudioListState, audios: Audio[]) => ({
      ...state,
      audios,
    })
  );

  private readonly updateDownloads = this.updater<Download[]>(
    (state: AudioListState, downloads: Download[]) => ({
      ...state,
      downloads,
    })
  );

  private readonly addDownload = this.effect<Download>(
    pipe(
      tap((download: Download) =>
        this.updateDownloads([...this.downloads(), download])
      )
    )
  );

  private readonly removeDownload = this.effect<Download>(
    pipe(
      tap((download: Download) =>
        this.updateDownloads(
          this.downloads().filter(
            (download: Download) => download.url !== download.url
          )
        )
      )
    )
  );

  private readonly setDownloadAudioInfo = this.effect<AudioInfo>(
    pipe(
      tap((info: AudioInfo) =>
        this.updateDownloads(
          this.downloads().map((download: Download) =>
            download.url === info.url ? { ...download, info } : download
          )
        )
      )
    )
  );

  private readonly loadAudios = this.effect<void>(
    pipe(
      switchMap(() => defer(() => this.storage.getAudios())),
      tap((audios: Audio[]) => this.updateAudios(audios))
    )
  );

  private readonly addAudio = this.effect<Audio>(
    pipe(
      tap((audio: Audio) => {
        this.updateAudios([...this.audios(), audio]);
        this.storage.addAudio(audio);
      })
    )
  );

  constructor() {
    super(INITIAL_AUDIO_LIST_STATE);
  }

  ngrxOnStateInit(): void {
    this.loadAudios();
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
