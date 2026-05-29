import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Coomic4UotoView } from './coomic4-uoto-view';

describe('Coomic4UotoView', () => {
  let component: Coomic4UotoView;
  let fixture: ComponentFixture<Coomic4UotoView>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Coomic4UotoView]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Coomic4UotoView);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
