import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StallsLayer } from './stalls-layer';

describe('StallsLayer', () => {
  let component: StallsLayer;
  let fixture: ComponentFixture<StallsLayer>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StallsLayer]
    })
    .compileComponents();

    fixture = TestBed.createComponent(StallsLayer);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
