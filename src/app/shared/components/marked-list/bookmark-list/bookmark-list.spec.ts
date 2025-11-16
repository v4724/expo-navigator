import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BookmarkList } from './bookmark-list';

describe('BookmarkList', () => {
  let component: BookmarkList;
  let fixture: ComponentFixture<BookmarkList>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BookmarkList]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BookmarkList);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
