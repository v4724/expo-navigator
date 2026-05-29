import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Coomic4Bokyaku } from './coomic4-bokyaku';

describe('Coomic4Bokyaku', () => {
  let component: Coomic4Bokyaku;
  let fixture: ComponentFixture<Coomic4Bokyaku>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Coomic4Bokyaku]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Coomic4Bokyaku);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
