import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Coomic4Touken } from './coomic4-touken';

describe('Coomic4Touken', () => {
  let component: Coomic4Touken;
  let fixture: ComponentFixture<Coomic4Touken>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Coomic4Touken]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Coomic4Touken);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
