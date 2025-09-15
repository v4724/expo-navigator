import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Magnifier } from './magnifier';

describe('Magnifier', () => {
  let component: Magnifier;
  let fixture: ComponentFixture<Magnifier>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Magnifier]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Magnifier);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
