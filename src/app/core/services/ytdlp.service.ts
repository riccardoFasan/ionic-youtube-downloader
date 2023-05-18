import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, map, tap } from 'rxjs';
import { AudioInfo } from '../models';
import { environment } from 'src/environments/environment.prod';

@Injectable({
  providedIn: 'root',
})
export class YtdlpService {
  private readonly http: HttpClient = inject(HttpClient);
  private readonly endpoint: string = environment.ytdlpServerUrl;

  getInfo(videoUrl: string): Observable<AudioInfo> {
    return this.http
      .get(`${this.endpoint}/info`, {
        params: { videoUrl },
      })
      .pipe(
        tap((info: any) => console.log(info)),
        map((info: any) => ({
          id: info.videoDetails.videoId,
          title: info.videoDetails.title,
          channel: info.videoDetails.ownerChannelName,
          duration: parseInt(info.videoDetails.lengthSeconds),
          thumbnailUrl: this.chooseThumbnail(info.videoDetails.thumbnails),
        }))
      );
  }

  download(videoUrl: string): Observable<ArrayBuffer> {
    return this.http.get(`${this.endpoint}/download`, {
      params: { videoUrl },
      // @ts-ignore
      responseType: 'arraybuffer',
      headers: {
        'Content-Type': 'audio/mp3',
      },
    });
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
