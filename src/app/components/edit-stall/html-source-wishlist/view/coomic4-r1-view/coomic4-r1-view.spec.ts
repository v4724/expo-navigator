import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Coomic4R1View } from './coomic4-r1-view';

describe('Coomic4R1View', () => {
  let component: Coomic4R1View;
  let fixture: ComponentFixture<Coomic4R1View>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Coomic4R1View]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Coomic4R1View);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
