import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Coomic4ToukenView } from './coomic4-touken-view';

describe('Coomic4ToukenView', () => {
  let component: Coomic4ToukenView;
  let fixture: ComponentFixture<Coomic4ToukenView>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Coomic4ToukenView]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Coomic4ToukenView);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
