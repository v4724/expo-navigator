import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WishlistEntranceView } from './wishlist-entrance-view';

describe('WishlistEntranceView', () => {
  let component: WishlistEntranceView;
  let fixture: ComponentFixture<WishlistEntranceView>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [WishlistEntranceView],
    }).compileComponents();

    fixture = TestBed.createComponent(WishlistEntranceView);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
