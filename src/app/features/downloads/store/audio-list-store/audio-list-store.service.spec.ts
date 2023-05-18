import { TestBed } from '@angular/core/testing';

import { AudioListStoreService } from './audio-list-store.service';

describe('AudioListStoreService', () => {
  let service: AudioListStoreService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AudioListStoreService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
