import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Coomic4Orig } from './coomic4-orig';

describe('Coomic4Orig', () => {
  let component: Coomic4Orig;
  let fixture: ComponentFixture<Coomic4Orig>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Coomic4Orig]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Coomic4Orig);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
