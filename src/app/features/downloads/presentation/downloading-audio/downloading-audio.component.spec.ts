import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DownloadingAudioComponent } from './downloading-audio.component';

describe('DownloadingAudioComponent', () => {
  let component: DownloadingAudioComponent;
  let fixture: ComponentFixture<DownloadingAudioComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [DownloadingAudioComponent]
    });
    fixture = TestBed.createComponent(DownloadingAudioComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
