import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StallGroupArea } from './stall-group-area';

describe('StallGroupArea', () => {
  let component: StallGroupArea;
  let fixture: ComponentFixture<StallGroupArea>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StallGroupArea]
    })
    .compileComponents();

    fixture = TestBed.createComponent(StallGroupArea);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
