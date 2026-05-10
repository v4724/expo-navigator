import { AfterViewInit, Component, ElementRef, inject, OnInit, ViewChild } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { Coomic4R1Service } from 'src/app/components/edit-stall/html-source-wishlist/model/coomic4-r1/coomic4-r1-service';
import { WishlistLayerService } from 'src/app/core/services/state/wishlist-layer-service';
import { WishlistService } from 'src/app/core/services/state/wishlist-service';
import { BaseLayer } from '../base-layer';
import { filter, take } from 'rxjs';
import { Coomic4UotoService } from 'src/app/components/edit-stall/html-source-wishlist/model/coomic4-uoto/coomic4-uoto-service';

@Component({
  selector: 'app-wishlist-layer',
  imports: [],
  templateUrl: './wishlist-layer.html',
  styleUrl: './wishlist-layer.scss',
})
export class WishlistLayer extends BaseLayer implements OnInit, AfterViewInit {
  @ViewChild('stallCanvas') declare canvasRef: ElementRef<HTMLCanvasElement>;

  private _wishlistService = inject(WishlistService);
  private _wishlistLayerService = inject(WishlistLayerService);

  // 為了取得攤位id
  private _coomic4R1Service = inject(Coomic4R1Service);
  private _coomic4UotoService = inject(Coomic4UotoService);

  wishlistLayerShow = toSignal(this._wishlistLayerService.show$);

  get checkedIds() {
    return this._wishlistLayerService.checkedIds;
  }

  ngOnInit() {
    this._wishlistLayerService.show$.pipe().subscribe((val) => {
      if (val) {
        this.drawLayer();
      } else {
        this.deleteLayer();
      }
    });
    this._wishlistLayerService.checkedIds$.pipe().subscribe((val) => {
      if (this.wishlistLayerShow()) {
        this.drawLayer();
      }
    });
  }

  ngAfterViewInit(): void {}

  drawLayer() {
    const canvas = this.canvasRef?.nativeElement;
    const ctx = canvas?.getContext('2d')!;
    const img = this.mapImage();

    if (!img || !canvas) return;

    // 設定畫布解析度與圖片一致
    canvas.width = img.naturalWidth;
    canvas.height = img.naturalHeight;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    ctx.font = '12px Arial';
    ctx.textAlign = 'center';

    this.checkedIds.forEach((id) => {
      const wishlist = this._wishlistService.getWishlistItemById(id);
      if (!wishlist) return;

      let service;
      switch (id) {
        case 'COOMIC4_R1': {
          service = this._coomic4R1Service;
          break;
        }
        case 'COOMIC4_UOTO': {
          service = this._coomic4UotoService;
          break;
        }
      }
      if (service) {
        service.initial(wishlist.data, wishlist.html);
        service.fetchEnd$
          .pipe(
            filter((val) => !!val),
            take(1),
          )
          .subscribe((val) => {
            const stallIds = Array.from(service.cacheByStallId.values()) as string[];
            stallIds.forEach((stallId) => {
              const s = this._stallService.findStall(stallId);
              if (!s) return;

              const { x, y, w, h } = this.getCanvasCoord(s);
              ctx.fillStyle = wishlist.fillColor;
              ctx.fillRect(x, y, w, h);

              ctx.fillStyle = '#000';
              ctx.fillText(s.padNum, x + w / 2, y + h / 2 + 4);
            });
          });
      }
    });
  }

  deleteLayer() {
    const canvas = this.canvasRef?.nativeElement;
    const ctx = canvas?.getContext('2d')!;
    const img = this.mapImage();

    if (!img || !canvas) return;

    // 設定畫布解析度與圖片一致
    canvas.width = img.naturalWidth;
    canvas.height = img.naturalHeight;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
  }
}
