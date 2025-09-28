import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GridHelper } from './grid-helper';

describe('GridHelper', () => {
  let component: GridHelper;
  let fixture: ComponentFixture<GridHelper>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GridHelper]
    })
    .compileComponents();

    fixture = TestBed.createComponent(GridHelper);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
