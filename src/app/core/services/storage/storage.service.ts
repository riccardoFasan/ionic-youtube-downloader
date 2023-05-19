import { Injectable } from '@angular/core';
import { Audio } from '../../models';
import { Preferences } from '@capacitor/preferences';

@Injectable({
  providedIn: 'root',
})
export class StorageService {
  private readonly audiosKey: string = 'audios';

  async addAudio(audio: Audio): Promise<void> {
    const audios: Audio[] = [...(await this.getAudios()), audio];
    Preferences.set({ key: this.audiosKey, value: JSON.stringify(audios) });
  }

  async removeAudio(audio: Audio): Promise<void> {
    const audios: Audio[] = (await this.getAudios()).filter(
      (a: Audio) => a.url !== audio.url
    );
    Preferences.set({ key: this.audiosKey, value: JSON.stringify(audios) });
  }

  async getAudios(): Promise<Audio[]> {
    const { value } = await Preferences.get({ key: this.audiosKey });
    if (value === null) return [];
    return JSON.parse(value) as Audio[];
  }
}
