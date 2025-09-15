import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StallsMap } from './stalls-map';

describe('StallsMap', () => {
  let component: StallsMap;
  let fixture: ComponentFixture<StallsMap>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StallsMap]
    })
    .compileComponents();

    fixture = TestBed.createComponent(StallsMap);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
