import { TestBed } from '@angular/core/testing';

import { AdvancedSeriesTagService } from './advanced-series-tag-service';

describe('AdvancedSeriesTagService', () => {
  let service: AdvancedSeriesTagService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AdvancedSeriesTagService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
