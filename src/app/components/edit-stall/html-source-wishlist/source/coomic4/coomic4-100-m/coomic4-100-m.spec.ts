import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Coomic4100M } from './coomic4-100-m';

describe('Coomic4100M', () => {
  let component: Coomic4100M;
  let fixture: ComponentFixture<Coomic4100M>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Coomic4100M]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Coomic4100M);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
