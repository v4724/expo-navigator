import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Coomic4KimetsuView } from './coomic4-kimetsu-view';

describe('Coomic4KimetsuView', () => {
  let component: Coomic4KimetsuView;
  let fixture: ComponentFixture<Coomic4KimetsuView>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Coomic4KimetsuView]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Coomic4KimetsuView);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
