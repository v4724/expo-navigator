import {
  AfterViewInit,
  Component,
  effect,
  ElementRef,
  inject,
  OnInit,
  ViewChild,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { BaseLayer } from '../base-layer';
import { toSignal } from '@angular/core/rxjs-interop';
import { ExpoStateService } from 'src/app/core/services/state/expo-state-service';
import { MarkedStallService } from 'src/app/core/services/state/marked-stall-service';
import { StallData } from 'src/app/core/interfaces/stall.interface';
import { MarkedList } from 'src/app/core/interfaces/marked-stall.interface';
import { combineLatest, forkJoin, switchMap, filter, take, tap, first, startWith } from 'rxjs';
import { StallMapService } from 'src/app/core/services/state/stall-map-service';

@Component({
  selector: 'app-bookmark-layer',
  imports: [CommonModule],
  template: `<canvas #stallCanvas class="absolute top-0 left-0 w-full h-full pointer-events-none">
  </canvas>`,
  styleUrl: './bookmark-layer.scss',
})
export class BookmarkLayer extends BaseLayer implements OnInit {
  @ViewChild('stallCanvas') declare canvasRef: ElementRef<HTMLCanvasElement>;

  private _markedStallService = inject(MarkedStallService);
  private _expoStateService = inject(ExpoStateService);

  markedList = toSignal(this._markedStallService.markedList$, { initialValue: [] });

  constructor() {
    super();
    this.isBackground = true;
  }

  ngOnInit() {
    combineLatest([
      this._expoStateService.fetchEnd$,
      this._expoStateService.bookmarkSwitch$,
      this._markedStallService.fetchEnd$,
      this._markedStallService.markedList$,
      this._stallMapService.mapContentWH$,
    ])
      .pipe(
        filter(([a, b, c, d, e]) => a && b && c && d.length > 0 && e.h > 0 && e.w > 0),
        take(1),
        switchMap(() => {
          requestAnimationFrame(() => {
            this.drawBookmarks();
          });

          return combineLatest([
            this._markedStallService.layerShown$.pipe(),
            this._markedStallService.toggleList$.pipe(startWith(null)),
            this._markedStallService.markedList$.pipe(),
            this._markedStallService.markedMapByStallId$.pipe(),
          ]);
        }),
      )
      .subscribe(([layerShown]) => {
        if (!layerShown) {
          this.clear();
        } else {
          this.drawBookmarks();
        }
      });
  }

  drawBookmarks() {
    this.clear();

    const canvas = this.canvasRef?.nativeElement;
    const ctx = canvas?.getContext('2d')!;

    if (!canvas || !ctx) return;

    // 開啟抗鋸齒平滑優化
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';

    // 設定樣式
    ctx.font = '16px Arial';
    ctx.textAlign = 'center';

    this.markedList().forEach((item) => {
      if (!item.show) return;

      item.list.forEach((s) => {
        // 將百分比座標轉換為畫布像素座標
        const { x, y, w, h } = this.getCanvasCoord(s);
        this.drawBookmark(s, item, ctx, x, y, w, h);
      });
    });

    ctx.restore();
  }

  drawBookmark(
    s: StallData,
    setting: MarkedList,
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    w: number,
    h: number,
  ) {
    // 設定字型為 Material Icons (需確保 CSS 已載入該字型)
    const size = 20;
    ctx.font = `${size}px "Material Icons", "Material Symbols Outlined"`;
    ctx.fillStyle = setting.iconColor;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    // 根據size大小及顯示位置調整座標
    switch (s.rule.bookmarkPosition) {
      case 'right':
        x = x + size * 2;
        y = y + h / 2;
        break;
      case 'left':
        x = x - size / 2;
        y = y + h / 2;
        break;
      case 'top':
        y = y - size / 2;
        x = x + w / 2;
        break;
      case 'bottom':
        y = y + size * 2;
        x = x + w / 2;
        break;
    }

    // 直接繪製圖示名稱（Material Icon 會透過 Ligature 自動轉為圖示）
    ctx.fillText(setting.icon || 'star', x, y);
  }

  clear() {
    const canvas = this.canvasRef?.nativeElement;
    const ctx = canvas?.getContext('2d')!;
    const img = this.mapImage();

    if (!canvas || !img || !ctx) return;
    this.loadLegendColor();

    // 畫布像素設定為 原始圖片寬高 × DPR
    canvas.width = this.canvasWH().width;
    canvas.height = this.canvasWH().height;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
  }
}
