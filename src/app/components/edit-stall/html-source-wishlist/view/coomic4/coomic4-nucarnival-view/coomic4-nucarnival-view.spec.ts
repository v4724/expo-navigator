import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Coomic4NucarnivalView } from './coomic4-nucarnival-view';

describe('Coomic4NucarnivalView', () => {
  let component: Coomic4NucarnivalView;
  let fixture: ComponentFixture<Coomic4NucarnivalView>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Coomic4NucarnivalView]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Coomic4NucarnivalView);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
