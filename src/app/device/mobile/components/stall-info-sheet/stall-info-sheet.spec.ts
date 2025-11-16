import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StallInfoSheet } from './stall-info-sheet';

describe('StallInfoSheet', () => {
  let component: StallInfoSheet;
  let fixture: ComponentFixture<StallInfoSheet>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StallInfoSheet]
    })
    .compileComponents();

    fixture = TestBed.createComponent(StallInfoSheet);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
