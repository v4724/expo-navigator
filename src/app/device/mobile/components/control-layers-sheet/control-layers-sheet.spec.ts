import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ControlLayersSheet } from './control-layers-sheet';

describe('ControlLayersSheet', () => {
  let component: ControlLayersSheet;
  let fixture: ComponentFixture<ControlLayersSheet>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ControlLayersSheet]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ControlLayersSheet);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
