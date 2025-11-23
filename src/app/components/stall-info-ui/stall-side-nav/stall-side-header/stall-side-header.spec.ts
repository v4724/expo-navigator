import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StallSideHeader } from './stall-side-header';

describe('StallSideHeader', () => {
  let component: StallSideHeader;
  let fixture: ComponentFixture<StallSideHeader>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StallSideHeader]
    })
    .compileComponents();

    fixture = TestBed.createComponent(StallSideHeader);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
