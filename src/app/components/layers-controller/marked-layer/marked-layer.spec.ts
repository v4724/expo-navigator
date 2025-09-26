import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MarkedLayer } from './marked-layer';

describe('MarkedLayer', () => {
  let component: MarkedLayer;
  let fixture: ComponentFixture<MarkedLayer>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MarkedLayer]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MarkedLayer);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
