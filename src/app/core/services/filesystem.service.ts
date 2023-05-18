import { Injectable } from '@angular/core';
import { Directory, Filesystem } from '@capacitor/filesystem';
import { Audio, AudioInfo } from '../models';
import { FileOpener } from '@capacitor-community/file-opener';

@Injectable({
  providedIn: 'root',
})
export class FilesystemService {
  private readonly targetDirectory: Directory = Directory.Library;
  private readonly extension: string = 'mp3';

  async saveAudio(info: AudioInfo, arrayBuffer: ArrayBuffer): Promise<Audio> {
    const buffer: Buffer = Buffer.from(arrayBuffer);
    const data: string = buffer.toString('base64');

    const { uri } = await Filesystem.writeFile({
      path: `${info.title}.${this.extension}`,
      data,
      directory: this.targetDirectory,
      recursive: true,
    });

    return { ...info, uri };
  }

  async openAudio(audio: Audio): Promise<void> {
    await FileOpener.open({
      filePath: audio.uri,
      contentType: `audio/${this.extension}`,
      openWithDefault: true,
    });
  }
}
