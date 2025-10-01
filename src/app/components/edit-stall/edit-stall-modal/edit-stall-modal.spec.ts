import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EditStallModal } from './edit-stall-modal';

describe('EditStallModal', () => {
  let component: EditStallModal;
  let fixture: ComponentFixture<EditStallModal>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EditStallModal]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EditStallModal);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
