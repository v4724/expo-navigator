import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdvancedSeriesTagDrawer } from './advanced-series-tag-drawer';

describe('AdvancedSeriesTagDrawer', () => {
  let component: AdvancedSeriesTagDrawer;
  let fixture: ComponentFixture<AdvancedSeriesTagDrawer>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AdvancedSeriesTagDrawer]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AdvancedSeriesTagDrawer);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
