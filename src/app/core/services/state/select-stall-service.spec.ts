import { TestBed } from '@angular/core/testing';

import { SelectStallService } from './select-stall-service';

describe('SelectStallService', () => {
  let service: SelectStallService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SelectStallService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
