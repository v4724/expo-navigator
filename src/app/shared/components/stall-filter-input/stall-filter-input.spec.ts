import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StallFilterInput } from './stall-filter-input';

describe('StallFilterInput', () => {
  let component: StallFilterInput;
  let fixture: ComponentFixture<StallFilterInput>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StallFilterInput]
    })
    .compileComponents();

    fixture = TestBed.createComponent(StallFilterInput);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
