import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { MatIcon } from '@angular/material/icon';
import { PopoverModule } from 'primeng/popover';
import { ToggleSwitch } from 'primeng/toggleswitch';
import { map } from 'rxjs';
import { WishlistLayerItem } from 'src/app/core/models/wishlist-item.model';
import { WishlistLayerService } from 'src/app/core/services/state/wishlist-layer-service';
import { WishlistService } from 'src/app/core/services/state/wishlist-service';

@Component({
  selector: 'app-wishlist-layer-btn',
  imports: [CommonModule, PopoverModule, ToggleSwitch, FormsModule, MatIcon],
  templateUrl: './wishlist-layer-btn.html',
  styleUrl: './wishlist-layer-btn.scss',
})
export class WishlistLayerBtn implements OnInit {
  private _wishlistService = inject(WishlistService);
  private _wishlistLayerService = inject(WishlistLayerService);

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

  ngOnInit() {}

  toggleLayer() {
    this._wishlistLayerService.toggleLayer();
  }

  toggleWishlistItem(item: WishlistLayerItem) {
    this._wishlistLayerService.toggleWishlistItem(item.id);
  }

  openUrl(url: string) {
    url && window.open(url);
  }
}
