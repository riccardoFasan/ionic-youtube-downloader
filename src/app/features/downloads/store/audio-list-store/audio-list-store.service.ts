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
} from 'rxjs';
import {
  FilesystemService,
  MessagerService,
  YtdlpService,
} from 'src/app/core/services';
import { Audio, AudioInfo, Download } from 'src/app/core/models';

@Injectable()
export class AudioListStoreService
  extends ComponentStore<AudioListState>
  implements OnStateInit
{
  private readonly ytdlp: YtdlpService = inject(YtdlpService);
  private readonly filesystem: FilesystemService = inject(FilesystemService);
  private readonly messager: MessagerService = inject(MessagerService);

  readonly downloads: Signal<Download[]> = this.selectSignal(
    (state) => state.downloads
  );
  readonly audios: Signal<Audio[]> = this.selectSignal((state) => state.audios);

  readonly download = this.effect<string>(
    // TODO: send a warning if the url is already downloading and return
    pipe(
      tap((url: string) => this.addDownload({ url })),
      switchMap((url: string) => this.downloadAudio(url)),
      switchMap(([info, arrayBuffer]: [AudioInfo, ArrayBuffer]) =>
        this.saveAudio(info, arrayBuffer)
      ),
      tap({
        next: (audio: Audio) => {
          this.messager.downloadSuccess(audio.title);
          this.removeDownload(audio.url);
          // TODO: add to audio
        },
        error: (url: string) => {
          this.messager.downloadError(url);
          this.removeDownload(url);
        },
      })
    )
  );

  private readonly addDownload = this.updater<Download>(
    (state: AudioListState, download: Download) => ({
      ...state,
      downloads: [...state.downloads, download],
    })
  );

  private readonly removeDownload = this.updater<string>(
    (state: AudioListState, url: string) => ({
      ...state,
      downloads: state.downloads.filter((d) => d.url !== url),
    })
  );

  private readonly updateDownloadInfo = this.updater<{
    url: string;
    info: AudioInfo;
  }>((state: AudioListState, { url, info }) => ({
    ...state,
    downloads: state.downloads.map((d) => (d.url === url ? { ...d, info } : d)),
  }));

  constructor() {
    super(INITIAL_AUDIO_LIST_STATE);
  }

  ngrxOnStateInit(): void {
    // TODO: get audios from filesystem
  }

  private downloadAudio(url: string): Observable<[AudioInfo, ArrayBuffer]> {
    return forkJoin([this.getInfo(url), this.ytdlp.download(url)]).pipe(
      catchError(() => throwError(() => url))
    );
  }

  private getInfo(url: string): Observable<AudioInfo> {
    return this.ytdlp
      .getInfo(url)
      .pipe(tap((info: AudioInfo) => this.updateDownloadInfo({ url, info })));
  }

  private saveAudio(
    info: AudioInfo,
    arrayBuffer: ArrayBuffer
  ): Observable<Audio> {
    return defer(() => this.filesystem.saveAudio(info, arrayBuffer)).pipe(
      catchError(() => throwError(() => info.url))
    );
  }
}
