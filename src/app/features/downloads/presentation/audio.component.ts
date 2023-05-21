import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  Output,
  inject,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { Audio } from 'src/app/core/models';
import { FilesystemService } from 'src/app/core/services';

@Component({
  selector: 'app-audio',
  standalone: true,
  imports: [CommonModule, IonicModule],
  template: `
    <ion-item>
      <ion-thumbnail slot="start">
        <ion-img [alt]="audio.title" [src]="audio.thumbnailUrl"> </ion-img>
      </ion-thumbnail>
      <ion-label>
        {{ audio.title }}
      </ion-label>
      <div class="ion-align-items-center ion-justify-content-end" slot="end">
        <ion-button (click)="openAudio()">
          <ion-icon size="small" name="play-outline"></ion-icon>
        </ion-button>
        <ion-button color="danger" (click)="removeAudio()">
          <ion-icon size="small" name="trash-outline"></ion-icon>
        </ion-button>
      </div>
    </ion-item>
  `,
  styles: [
    `
      div {
        display: flex;
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AudioComponent {
  private readonly filesystem: FilesystemService = inject(FilesystemService);

  @Input({ required: true }) audio!: Audio;

  @Output() remove: EventEmitter<Audio> = new EventEmitter<Audio>();

  protected openAudio(): void {
    this.filesystem.openAudioFile(this.audio);
  }

  protected removeAudio(): void {
    this.remove.emit(this.audio);
  }
}
