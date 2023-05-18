import { Injectable } from '@angular/core';
import { Directory, Filesystem } from '@capacitor/filesystem';
import { Audio, AudioInfo } from '../../models';
import { FileOpener } from '@capacitor-community/file-opener';

@Injectable({
  providedIn: 'root',
})
export class FilesystemService {
  private readonly targetDirectory: Directory = Directory.Library;
  private readonly extension: string = 'mp3';

  async saveAudio(info: AudioInfo, arrayBuffer: ArrayBuffer): Promise<Audio> {
    const data: string = await this.toDataURL(arrayBuffer);

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

  private async toDataURL(arrayBuffer: ArrayBuffer): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = (error) => reject(error);
      reader.readAsDataURL(new Blob([arrayBuffer]));
    });
  }
}
