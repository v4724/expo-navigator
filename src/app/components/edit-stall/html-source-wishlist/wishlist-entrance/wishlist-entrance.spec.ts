import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WishlistEntrance } from './wishlist-entrance';

describe('WishlistEntrance', () => {
  let component: WishlistEntrance;
  let fixture: ComponentFixture<WishlistEntrance>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [WishlistEntrance]
    })
    .compileComponents();

    fixture = TestBed.createComponent(WishlistEntrance);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
