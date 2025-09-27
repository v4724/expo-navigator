import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StallModal } from './stall-modal';

describe('StallModal', () => {
  let component: StallModal;
  let fixture: ComponentFixture<StallModal>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StallModal]
    })
    .compileComponents();

    fixture = TestBed.createComponent(StallModal);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
