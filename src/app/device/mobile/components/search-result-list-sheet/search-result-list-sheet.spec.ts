import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SearchResultListSheet } from './search-result-list-sheet';

describe('SearchResultListSheet', () => {
  let component: SearchResultListSheet;
  let fixture: ComponentFixture<SearchResultListSheet>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SearchResultListSheet]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SearchResultListSheet);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
