import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdvancedSeriesTag } from './advanced-series-tag';

describe('AdvancedSeriesTag', () => {
  let component: AdvancedSeriesTag;
  let fixture: ComponentFixture<AdvancedSeriesTag>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AdvancedSeriesTag]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AdvancedSeriesTag);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
