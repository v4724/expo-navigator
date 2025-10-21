import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ResultListBtn } from './result-list-btn';

describe('ResultListBtn', () => {
  let component: ResultListBtn;
  let fixture: ComponentFixture<ResultListBtn>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ResultListBtn]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ResultListBtn);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
