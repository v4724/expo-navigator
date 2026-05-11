import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Coomic4KoreaView } from './coomic4-korea-view';

describe('Coomic4KoreaView', () => {
  let component: Coomic4KoreaView;
  let fixture: ComponentFixture<Coomic4KoreaView>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Coomic4KoreaView]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Coomic4KoreaView);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
