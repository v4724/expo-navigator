import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EditMarkedList } from './edit-marked-list';

describe('EditMarkedList', () => {
  let component: EditMarkedList;
  let fixture: ComponentFixture<EditMarkedList>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EditMarkedList]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EditMarkedList);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
