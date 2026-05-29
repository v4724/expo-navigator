import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Coomic4100MView } from './coomic4-100-m-view';

describe('Coomic4100MView', () => {
  let component: Coomic4100MView;
  let fixture: ComponentFixture<Coomic4100MView>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Coomic4100MView]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Coomic4100MView);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
