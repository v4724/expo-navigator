import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ExposMap } from './expos-map';

describe('ExposMap', () => {
  let component: ExposMap;
  let fixture: ComponentFixture<ExposMap>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ExposMap]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ExposMap);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
