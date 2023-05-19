import { Audio, Download } from 'src/app/core/models';

export interface AudioListState {
  downloads: Download[];
  audios: Audio[];
}

export const INITIAL_AUDIO_LIST_STATE: AudioListState = {
  downloads: [],
  audios: [],
};
