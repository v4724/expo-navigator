import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OnlyAreaBtn } from './only-area-btn';

describe('OnlyAreaBtn', () => {
  let component: OnlyAreaBtn;
  let fixture: ComponentFixture<OnlyAreaBtn>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OnlyAreaBtn]
    })
    .compileComponents();

    fixture = TestBed.createComponent(OnlyAreaBtn);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
