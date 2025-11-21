import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ControlLayersDrawer } from './control-layers-drawer';

describe('ControlLayersDrawer', () => {
  let component: ControlLayersDrawer;
  let fixture: ComponentFixture<ControlLayersDrawer>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ControlLayersDrawer],
    }).compileComponents();

    fixture = TestBed.createComponent(ControlLayersDrawer);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
