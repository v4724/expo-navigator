import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Coomic4BokyakuView } from './coomic4-bokyaku-view';

describe('Coomic4BokyakuView', () => {
  let component: Coomic4BokyakuView;
  let fixture: ComponentFixture<Coomic4BokyakuView>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Coomic4BokyakuView]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Coomic4BokyakuView);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
