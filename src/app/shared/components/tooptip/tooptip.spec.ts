import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Tooptip } from './tooptip';

describe('Tooptip', () => {
  let component: Tooptip;
  let fixture: ComponentFixture<Tooptip>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Tooptip]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Tooptip);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
