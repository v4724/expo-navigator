import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StallInfoDrawer } from './stall-info-drawer';

describe('StallInfoDrawer', () => {
  let component: StallInfoDrawer;
  let fixture: ComponentFixture<StallInfoDrawer>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StallInfoDrawer],
    }).compileComponents();

    fixture = TestBed.createComponent(StallInfoDrawer);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
