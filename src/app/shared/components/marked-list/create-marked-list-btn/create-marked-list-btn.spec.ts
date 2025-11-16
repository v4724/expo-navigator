import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CreateMarkedListBtn } from './create-marked-list-btn';

describe('CreateMarkedListBtn', () => {
  let component: CreateMarkedListBtn;
  let fixture: ComponentFixture<CreateMarkedListBtn>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CreateMarkedListBtn]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CreateMarkedListBtn);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
