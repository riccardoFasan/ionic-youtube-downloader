import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Output,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';

@Component({
  selector: 'app-search',
  standalone: true,
  imports: [CommonModule, IonicModule, ReactiveFormsModule],
  template: `
    <form [formGroup]="form">
      <ion-input
        formControlName="search"
        label="Youtube URL"
        label-placement="floating"
        fill="solid"
        placeholder="Enter text"
      ></ion-input>
      <ion-button
        expand="block"
        type="button"
        [disabled]="form.invalid"
        (click)="download()"
      >
        Download
      </ion-button>
    </form>
  `,
  styles: [],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SearchComponent {
  @Output() search: EventEmitter<string> = new EventEmitter<string>();

  protected readonly form: FormGroup = new FormGroup({
    search: new FormControl('', [Validators.required]),
  });

  protected download(): void {
    const url: string = this.form.value.search;
    this.search.emit(url);
    this.form.reset();
  }
}
