import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DrawerOnMobile } from './drawer-on-mobile';

describe('DrawerOnMobile', () => {
  let component: DrawerOnMobile;
  let fixture: ComponentFixture<DrawerOnMobile>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DrawerOnMobile]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DrawerOnMobile);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
