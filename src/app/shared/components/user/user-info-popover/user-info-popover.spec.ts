import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UserInfoPopover } from './user-info-popover';

describe('UserInfoPopover', () => {
  let component: UserInfoPopover;
  let fixture: ComponentFixture<UserInfoPopover>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UserInfoPopover]
    })
    .compileComponents();

    fixture = TestBed.createComponent(UserInfoPopover);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
