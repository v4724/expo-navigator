import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EditBtn } from './edit-btn';

describe('EditBtn', () => {
  let component: EditBtn;
  let fixture: ComponentFixture<EditBtn>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EditBtn]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EditBtn);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
