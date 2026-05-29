import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Coomic4Uoto } from './coomic4-uoto';

describe('Coomic4Uoto', () => {
  let component: Coomic4Uoto;
  let fixture: ComponentFixture<Coomic4Uoto>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Coomic4Uoto]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Coomic4Uoto);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
