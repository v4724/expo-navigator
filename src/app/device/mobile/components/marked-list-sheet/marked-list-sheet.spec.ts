import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MarkedListSheet } from './marked-list-sheet';

describe('MarkedListSheet', () => {
  let component: MarkedListSheet;
  let fixture: ComponentFixture<MarkedListSheet>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MarkedListSheet]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MarkedListSheet);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
