import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StallSideNav } from './stall-side-nav';

describe('StallSideNav', () => {
  let component: StallSideNav;
  let fixture: ComponentFixture<StallSideNav>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StallSideNav]
    })
    .compileComponents();

    fixture = TestBed.createComponent(StallSideNav);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
