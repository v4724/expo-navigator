import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StallSideContent } from './stall-side-content';

describe('StallSideContent', () => {
  let component: StallSideContent;
  let fixture: ComponentFixture<StallSideContent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StallSideContent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(StallSideContent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
