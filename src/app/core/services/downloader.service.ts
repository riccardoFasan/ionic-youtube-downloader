import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, map } from 'rxjs';
import { VideoInfo } from '../models';

@Injectable({
  providedIn: 'root',
})
export class DownloaderService {
  private readonly http: HttpClient = inject(HttpClient);

  getInfo(videoUrl: string): Observable<VideoInfo> {
    return <any>this.http
      .get('http://localhost:3000/info', {
        params: { videoUrl },
      })
      .pipe(
        map((info: any) => ({
          title: info.videoDetails.title,
          channel: info.videoDetails.ownerChannelName,
          duration: parseInt(info.videoDetails.lengthSeconds),
          thumbnailUrl: this.chooseThumbnail(info.videoDetails.thumbnails),
        }))
      );
  }

  download(videoUrl: string): Observable<Blob> {
    return this.http
      .get<ArrayBuffer>('http://localhost:3000/download', {
        params: { videoUrl },
        // @ts-ignore
        responseType: 'arraybuffer',
        headers: {
          'Content-Type': 'audio/mp3',
        },
      })
      .pipe(map((buffer: ArrayBuffer) => new Blob([buffer])));
  }

  private chooseThumbnail(
    thumbnails: { url: string; heigth: number; width: number }[] = []
  ): string | undefined {
    const maxDefinitionThumbnail = thumbnails.reduce((previous, currrent) => {
      if (previous.width > currrent.width) return previous;
      return currrent;
    });
    return maxDefinitionThumbnail?.url;
  }
}
