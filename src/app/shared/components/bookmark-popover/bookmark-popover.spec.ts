import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BookmarkPopover } from './bookmark-popover';

describe('BookmarkPopover', () => {
  let component: BookmarkPopover;
  let fixture: ComponentFixture<BookmarkPopover>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BookmarkPopover]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BookmarkPopover);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
