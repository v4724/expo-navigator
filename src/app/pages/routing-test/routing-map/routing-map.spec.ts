import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RoutingMap } from './routing-map';

describe('RoutingMap', () => {
  let component: RoutingMap;
  let fixture: ComponentFixture<RoutingMap>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RoutingMap]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RoutingMap);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
