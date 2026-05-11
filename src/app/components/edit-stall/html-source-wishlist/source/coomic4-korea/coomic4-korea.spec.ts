import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Coomic4Korea } from './coomic4-korea';

describe('Coomic4Korea', () => {
  let component: Coomic4Korea;
  let fixture: ComponentFixture<Coomic4Korea>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Coomic4Korea]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Coomic4Korea);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
