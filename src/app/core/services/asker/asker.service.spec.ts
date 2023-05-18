import { TestBed } from '@angular/core/testing';

import { AskerService } from './asker.service';

describe('AskerService', () => {
  let service: AskerService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AskerService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
