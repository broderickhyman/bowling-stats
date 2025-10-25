import { TestBed } from '@angular/core/testing';

import { PinpalService } from './pinpal.service';

describe('PinpalService', () => {
  let service: PinpalService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PinpalService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
