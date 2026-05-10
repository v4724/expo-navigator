import { CommonModule } from '@angular/common';
import { Component, computed, inject, ViewChild } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { MatIcon } from '@angular/material/icon';
import { ButtonModule } from 'primeng/button';
import { ToggleSwitch } from 'primeng/toggleswitch';
import { map } from 'rxjs';
import { WishlistLayerItem } from 'src/app/core/models/wishlist-item.model';
import { WishlistLayerService } from 'src/app/core/services/state/wishlist-layer-service';
import { WishlistService } from 'src/app/core/services/state/wishlist-service';
import { DrawerOnMobile } from 'src/app/shared/components/drawer-on-mobile/drawer-on-mobile';

@Component({
  selector: 'app-wishlist-drawer',
  imports: [CommonModule, ButtonModule, ToggleSwitch, FormsModule, DrawerOnMobile, MatIcon],
  templateUrl: './wishlist-drawer.html',
  styleUrl: './wishlist-drawer.scss',
})
export class WishlistDrawer {
  @ViewChild(DrawerOnMobile) drawer!: DrawerOnMobile;

  private _wishlistService = inject(WishlistService);
  private _wishlistLayerService = inject(WishlistLayerService);

  // Data
  // 場內 only
  fetchEnd = toSignal(this._wishlistService.fetchEnd$);
  wishlist = toSignal(
    this._wishlistService.fetchEnd$.pipe(
      map(() => {
        const arr = Array.from(this._wishlistService.allWishlistItems.values()) ?? [];
        return arr.map((item) => {
          return {
            ...item,
            checked: false,
          } as WishlistLayerItem;
        });
      }),
    ),
    { initialValue: [] },
  );

  checked = false;

  ngOnInit() {
    this._wishlistLayerService.show$.pipe().subscribe((val) => {
      this.checked = val;
    });
  }

  show() {
    this.drawer.show();
  }

  close() {
    this.drawer.close();
  }

  toggleLayer() {
    this._wishlistLayerService.toggleLayer();
  }

  toggleWishlistItem(id: string) {
    this._wishlistLayerService.toggleWishlistItem(id);
  }

  openUrl(url: string) {
    url && window.open(url);
  }
}
