import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EditNotePopover } from './edit-note-popover';

describe('EditNotePopover', () => {
  let component: EditNotePopover;
  let fixture: ComponentFixture<EditNotePopover>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EditNotePopover]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EditNotePopover);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
