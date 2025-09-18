import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StallGridHelper } from './stall-grid-helper';

describe('StallGridHelper', () => {
  let component: StallGridHelper;
  let fixture: ComponentFixture<StallGridHelper>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StallGridHelper]
    })
    .compileComponents();

    fixture = TestBed.createComponent(StallGridHelper);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
