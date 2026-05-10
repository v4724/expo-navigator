import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WishlistLayer } from './wishlist-layer';

describe('WishlistLayer', () => {
  let component: WishlistLayer;
  let fixture: ComponentFixture<WishlistLayer>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [WishlistLayer]
    })
    .compileComponents();

    fixture = TestBed.createComponent(WishlistLayer);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
