import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OnlyAreaDrawer } from './only-area-drawer';

describe('OnlyAreaDrawer', () => {
  let component: OnlyAreaDrawer;
  let fixture: ComponentFixture<OnlyAreaDrawer>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OnlyAreaDrawer],
    }).compileComponents();

    fixture = TestBed.createComponent(OnlyAreaDrawer);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
