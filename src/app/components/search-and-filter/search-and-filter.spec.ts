import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SearchAndFilter } from './search-and-filter';

describe('SearchAndFilter', () => {
  let component: SearchAndFilter;
  let fixture: ComponentFixture<SearchAndFilter>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SearchAndFilter]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SearchAndFilter);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
