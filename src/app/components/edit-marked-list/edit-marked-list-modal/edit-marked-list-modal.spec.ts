import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EditMarkedListModal } from './edit-marked-list-modal';

describe('EditMarkedListModal', () => {
  let component: EditMarkedListModal;
  let fixture: ComponentFixture<EditMarkedListModal>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EditMarkedListModal]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EditMarkedListModal);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
