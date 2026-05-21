import { AfterViewInit, Component, ElementRef, inject, OnInit, ViewChild } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { Coomic4R1Service } from '@coomic4Model/coomic4-r1/coomic4-r1-service';
import { WishlistLayerService } from 'src/app/core/services/state/wishlist-layer-service';
import { WishlistService } from 'src/app/core/services/state/wishlist-service';
import { BaseLayer } from '../base-layer';
import { Coomic4UotoService } from '@coomic4Model/coomic4-uoto/coomic4-uoto-service';
import { Coomic4NucarnivalService } from '@coomic4Model/coomic4-nucarnival/coomic4-nucarnival-service';
import { Coomic4ToukenService } from '@coomic4Model/coomic4-touken/coomic4-touken-service';
import { Coomic4KoreaService } from '@coomic4Model/coomic4-korea/coomic4-korea-service';
import { Coomic4100MService } from '@coomic4Model/coomic4-100-m/coomic4-100-m-service';
import { Coomic4KimetsuService } from '@coomic4Model/coomic4-kimetsu/coomic4-kimetsu-service';
import { Coomic4BokyakuService } from '@coomic4Model/coomic4-bokyaku/coomic4-bokyaku-service';
import { WishlistDefaultService } from '@coomic4Model/default-service';
import { Coomic4OrigService } from '@coomic4Model/coomic4-orig/coomic4-orig-service';
import { Coomic4MihayoService } from '@coomic4Model/coomic4-hero-mihayo/coomic4-mihayo-service';
import { Coomic4HeroService } from '@coomic4Model/coomic4-hero-mihayo/coomic4-hero-service';
import { Coomic4NijisanjiService } from '@coomic4Model/coomic4-nijisanji/coomic4-nijisanji-service';
import { Coomic4NintamaService } from '@coomic4Model/coomic4-nintama/coomic4-nintama-service';

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
  private _coomic4NucarnivalService = inject(Coomic4NucarnivalService);
  private _coomic4ToukenService = inject(Coomic4ToukenService);
  private _coomic4KoreaService = inject(Coomic4KoreaService);
  private _coomic4100MService = inject(Coomic4100MService);
  private _coomic4KimetsuService = inject(Coomic4KimetsuService);
  private _coomic4BokyakuService = inject(Coomic4BokyakuService);
  private _coomic4OrigService = inject(Coomic4OrigService);
  private _coomic4HeroService = inject(Coomic4HeroService);
  private _coomic4MihayoService = inject(Coomic4MihayoService);
  private _coomic4NijisanjiService = inject(Coomic4NijisanjiService);
  private _coomic4NintamaService = inject(Coomic4NintamaService);
  private _wishlistDefaultService = inject(WishlistDefaultService);

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

    // 避免混亂，先將所有攤位圖上灰色
    this.stalls().forEach((s) => {
      const { x, y, w, h } = this.getCanvasCoord(s);
      ctx.fillStyle = '#f3f4f6';
      ctx.fillRect(x, y, w, h);

      ctx.fillStyle = '#4a5565';
      ctx.fillText(s.padNum, x + w / 2, y + h / 2 + 4);
    });

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
        case 'COOMIC4_NUCARNIVAL': {
          service = this._coomic4NucarnivalService;
          break;
        }
        case 'COOMIC4_TOUKEN': {
          service = this._coomic4ToukenService;
          break;
        }
        case 'COOMIC4_KOREA': {
          service = this._coomic4KoreaService;
          break;
        }
        case 'COOMIC4_100_M': {
          service = this._coomic4100MService;
          break;
        }
        case 'COOMIC4_KIMETSU': {
          service = this._coomic4KimetsuService;
          break;
        }
        case 'COOMIC4_BOKYAKU': {
          service = this._coomic4BokyakuService;
          break;
        }
        case 'COOMIC4_ORIG': {
          service = this._coomic4OrigService;
          break;
        }
        case 'COOMIC4_HERO': {
          service = this._coomic4HeroService;

          break;
        }
        case 'COOMIC4_MIHAYO': {
          service = this._coomic4MihayoService;
          break;
        }
        case 'COOMIC4_NIJISANJI': {
          service = this._coomic4NijisanjiService;
          break;
        }
        case 'COOMIC4_NINTAMA': {
          service = this._coomic4NintamaService;
          break;
        }
        case 'COOMIC4_DEFAULT': {
          service = this._wishlistDefaultService;
        }
      }
      if (service) {
        service.initial(wishlist.data, wishlist.html);
        service.fetchEnd$().subscribe((val) => {
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
