import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Coomic4OrigView } from './coomic4-orig-view';

describe('Coomic4OrigView', () => {
  let component: Coomic4OrigView;
  let fixture: ComponentFixture<Coomic4OrigView>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Coomic4OrigView]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Coomic4OrigView);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
