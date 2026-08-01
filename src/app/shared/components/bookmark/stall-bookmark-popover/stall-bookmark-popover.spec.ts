import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StallBookmarkPopover } from './stall-bookmark-popover';

describe('StallBookmarkPopover', () => {
  let component: StallBookmarkPopover;
  let fixture: ComponentFixture<StallBookmarkPopover>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StallBookmarkPopover],
    }).compileComponents();

    fixture = TestBed.createComponent(StallBookmarkPopover);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
