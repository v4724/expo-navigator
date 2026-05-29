import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StallTooltip } from './stall-tooltip';

describe('StallTooltip', () => {
  let component: StallTooltip;
  let fixture: ComponentFixture<StallTooltip>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StallTooltip]
    })
    .compileComponents();

    fixture = TestBed.createComponent(StallTooltip);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
