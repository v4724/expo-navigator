import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MarkedListDrawer } from './marked-list-drawer';

describe('MarkedListDrawer', () => {
  let component: MarkedListDrawer;
  let fixture: ComponentFixture<MarkedListDrawer>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MarkedListDrawer]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MarkedListDrawer);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
