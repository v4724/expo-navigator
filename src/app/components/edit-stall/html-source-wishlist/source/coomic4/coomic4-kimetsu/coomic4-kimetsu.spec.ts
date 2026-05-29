import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Coomic4Kimetsu } from './coomic4-kimetsu';

describe('Coomic4Kimetsu', () => {
  let component: Coomic4Kimetsu;
  let fixture: ComponentFixture<Coomic4Kimetsu>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Coomic4Kimetsu]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Coomic4Kimetsu);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
