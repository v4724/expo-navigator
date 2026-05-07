import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Coomic4R1 } from './coomic4-r1';

describe('Coomic4R1', () => {
  let component: Coomic4R1;
  let fixture: ComponentFixture<Coomic4R1>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Coomic4R1]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Coomic4R1);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
