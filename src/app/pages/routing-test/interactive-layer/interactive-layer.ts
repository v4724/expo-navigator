import {
  ChangeDetectorRef,
  Component,
  ElementRef,
  inject,
  input,
  OnInit,
  signal,
  ViewChild,
  WritableSignal,
} from '@angular/core';
import { StallData } from 'src/app/core/interfaces/stall.interface';
import { Tooltip, TooltipModule } from 'primeng/tooltip';
import { CommonModule } from '@angular/common';
import { BaseLayer } from '../../stalls-map/layers/base-layer';
import { StallBookmarkPopover } from '../../../shared/components/bookmark/stall-bookmark-popover/stall-bookmark-popover';
import { MatIcon } from '@angular/material/icon';
import { ButtonIcon } from 'primeng/button';

@Component({
  selector: 'app-interactive-layer',
  imports: [CommonModule, TooltipModule, StallBookmarkPopover, MatIcon, ButtonIcon],
  templateUrl: './interactive-layer.html',
  styleUrl: './interactive-layer.scss',
})
export class InteractiveLayer extends BaseLayer implements OnInit {
  @ViewChild('stallCanvas') declare canvasRef: ElementRef<HTMLCanvasElement>;
  @ViewChild(StallBookmarkPopover) bookmarkPopover!: StallBookmarkPopover;
  @ViewChild('opTarget') opTarget!: ElementRef<HTMLDivElement>;
  @ViewChild('container') container!: ElementRef<HTMLDivElement>;
  @ViewChild(Tooltip, { read: Tooltip }) tooltip!: Tooltip;

  onDragging = input<boolean>();

  private cdr = inject(ChangeDetectorRef);

  _hoveredStallRef!: ElementRef<HTMLDivElement>;
  @ViewChild('hoveredStallRef') set hoveredStallRef(content: ElementRef<HTMLDivElement>) {
    if (content) {
      // 當元素被渲染出來時，這裡會被執行
      this._hoveredStallRef = content;
      this.updateHoverdStallInfo(content);
    }
  }

  hoveredStall: WritableSignal<StallData | undefined> = signal(undefined);
  clickedStall: WritableSignal<StallData | undefined> = signal(undefined);

  constructor() {
    super();
  }

  ngOnInit() {
    this._selectStallService.selectedStallId$.subscribe(() => {
      const stall = this._selectStallService.selectedStall;
      this.clickedStall.set(stall);
      this.drawStall();
    });
  }

  drawStall() {
    const canvas = this.canvasRef?.nativeElement;
    const ctx = canvas?.getContext('2d')!;

    if (!ctx) return;
    this.loadLegendColor();

    // 設定畫布解析度與圖片一致
    canvas.width = this.canvasWH().width;
    canvas.height = this.canvasWH().height;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // 設定樣式
    ctx.font = '12px Arial';
    ctx.textAlign = 'center';

    const s = this.clickedStall();
    const hs = this.hoveredStall();
    if (s) {
      // 將百分比座標轉換為畫布像素座標
      let { x, y, w, h } = this.getCanvasCoord(s);
      this.drawSelectedStall(s, ctx, x, y, w, h);
    }

    if (hs) {
      let { x, y, w, h } = this.getCanvasCoord(hs);
      const scale = 1.2;
      const dw = w * (scale - 1);
      const dh = h * (scale - 1);
      x -= dw / 2;
      y -= dh / 2;
      w *= scale;
      h *= scale;
      // 簡約現代風格 (字重 bold 會更有質感)
      ctx.font = '20px "Inter", "Roboto", "Segoe UI", sans-serif';
      if (s?.id === hs.id) {
        this.drawSelectedStall(hs, ctx, x, y, w, h);
      } else {
        this.drawDefaultStall(hs, ctx, x, y, w, h);
      }
      ctx.strokeStyle = '#000';
      ctx.lineWidth = 1;
      ctx.strokeRect(x, y, w, h);
    }
  }

  onMapClick(event: MouseEvent | TouchEvent) {
    let stall = this.hoveredStall();
    if (this._uiStateService.isMobile()) {
      stall = this.getMappingStall(event);
    }
    this.clickedStall.set(stall);
    this._selectStallService.selected = stall ? stall.id : null;

    this.cdr.detectChanges();

    const op = this.bookmarkPopover?.op;

    if (stall) {
      requestAnimationFrame(() => {
        if (op.overlayVisible) {
          op.align();
        } else {
          op.show(null, this.opTarget.nativeElement);
        }
      });
    } else {
      op.hide();
    }
  }

  // 偵測滑鼠指到哪個攤位
  onMouseMove(event: MouseEvent) {
    if (this._uiStateService.isMobile() || this.onDragging()) {
      this.hoveredStall.set(undefined);
      return;
    }

    const hoveredStall = this.getMappingStall(event);
    const last = this.hoveredStall();
    this.hoveredStall.set(hoveredStall);

    if (hoveredStall) {
      if (hoveredStall.id != last?.id) {
        this.cdr.detectChanges();
        // 傳入當前的 MouseEvent 讓 Tooltip 知道滑鼠游標座標
        requestAnimationFrame(() => {
          this.tooltip?.show();
        });
      }
    } else {
      this.tooltip?.hide();
    }
    this.updateHoverdStallInfo(this._hoveredStallRef);

    this.drawStall();
  }

  private drawSelectedStall(
    s: StallData,
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    w: number,
    h: number,
  ) {
    ctx.fillStyle = this.getRGBColor(this.legendColor?.selected);
    ctx.fillRect(x, y, w, h);

    ctx.fillStyle = '#fff';
    ctx.fillText(s.padNum, x + w / 2, y + h / 2 + 4);
  }

  private updateHoverdStallInfo(content?: ElementRef<HTMLDivElement>) {
    if (!content) return;
    const rect = content.nativeElement.getBoundingClientRect();
    const info = { rect, s: this.hoveredStall() };
    this._stallService.hoveredStallInfo = info;
  }

  private getMappingStall(event: MouseEvent | TouchEvent) {
    const container = this.container?.nativeElement || (event.currentTarget as HTMLElement);
    if (!container) return undefined;

    const rect = container.getBoundingClientRect();

    // 💡 關鍵修正 2：相容 MouseEvent 與 TouchEvent 取得正確的 Client 座標
    let clientX = 0;
    let clientY = 0;

    if ('touches' in event && event.touches.length > 0) {
      clientX = event.touches[0].clientX;
      clientY = event.touches[0].clientY;
    } else if ('changedTouches' in event && event.changedTouches.length > 0) {
      clientX = event.changedTouches[0].clientX;
      clientY = event.changedTouches[0].clientY;
    } else if (event instanceof MouseEvent) {
      clientX = event.clientX;
      clientY = event.clientY;
    }

    // 算相對百分比 (0 - 100)
    const mouseX = ((clientX - rect.left) / rect.width) * 100;
    const mouseY = ((clientY - rect.top) / rect.height) * 100;

    // 2000 個資料搜尋大約只需 1-2ms，遠快於 DOM 渲染
    return this.stalls().find((s) => {
      return (
        mouseX >= s.coords.left &&
        mouseX <= s.coords.left + s.coords.width &&
        mouseY >= s.coords.top &&
        mouseY <= s.coords.top + s.coords.height
      );
    });
  }

  openUrl(url?: string) {
    url && window.open(url);
  }
}
