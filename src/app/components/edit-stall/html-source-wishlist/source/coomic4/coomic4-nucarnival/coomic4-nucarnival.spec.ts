import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Coomic4Nucarnival } from './coomic4-nucarnival';

describe('Coomic4Nucarnival', () => {
  let component: Coomic4Nucarnival;
  let fixture: ComponentFixture<Coomic4Nucarnival>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Coomic4Nucarnival]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Coomic4Nucarnival);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
