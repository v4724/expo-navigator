import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ToggleController } from './toggle-controller';

describe('ToggleController', () => {
  let component: ToggleController;
  let fixture: ComponentFixture<ToggleController>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ToggleController]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ToggleController);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
