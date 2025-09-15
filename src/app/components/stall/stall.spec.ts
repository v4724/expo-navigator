import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Stall } from './stall';

describe('Stall', () => {
  let component: Stall;
  let fixture: ComponentFixture<Stall>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Stall]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Stall);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
