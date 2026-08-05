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
import { toObservable } from '@angular/core/rxjs-interop';
import { filter, take, tap } from 'rxjs';

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
  @ViewChild(Tooltip, { read: Tooltip }) tooltip!: Tooltip;

  onPointerdownEvent = input<PointerEvent>();
  onPointermoveEvent = input<PointerEvent>();
  onPointerupEvent = input<PointerEvent>();
  onPointercancelEvent = input<PointerEvent>();
  onTourchstartEvent = input<TouchEvent>();
  onTouchmoveEvent = input<TouchEvent>();
  onTouchendEvent = input<TouchEvent>();

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

  onPointerdown$ = toObservable(this.onPointerdownEvent);
  onPointermoveEvent$ = toObservable(this.onPointermoveEvent);
  onPointerupEvent$ = toObservable(this.onPointerupEvent);
  onPointercancelEvent$ = toObservable(this.onPointercancelEvent);
  onTouchstartEvent$ = toObservable(this.onTourchstartEvent);
  onTouchmoveEvent$ = toObservable(this.onTouchmoveEvent);
  onTouchendEvent$ = toObservable(this.onTouchendEvent);

  constructor() {
    super();
  }

  ngOnInit() {
    this._selectStallService.selectedStallId$.subscribe(() => {
      const stall = this._selectStallService.selectedStall;
      this.clickedStall.set(stall);
      this.drawStall();
    });

    this.onPointerdown$.subscribe((e) => {
      e && this.onPointerDown(e);
    });
    this.onPointermoveEvent$.subscribe((e) => {
      e && this.onPointerMove(e);
    });
    this.onPointerupEvent$.subscribe((e) => {
      e && this.onPointerUp(e);
    });
    this.onPointercancelEvent$.subscribe((e) => {
      e && this.onPointerUp(e);
    });
    this.onTouchstartEvent$.subscribe((e) => {
      e && this.onTouchStart(e);
    });
    this.onTouchmoveEvent$.subscribe((e) => {
      e && this.onTouchMove(e);
    });
    this.onTouchendEvent$.subscribe((e) => {
      e && this.onTouchEnd(e);
    });
  }

  ngAfterViewInit() {}

  isPointerDown = false;
  isDragging = false;
  onPointerDown(e: PointerEvent) {
    this.isPointerDown = true;
    this.isDragging = false; // 初始先假設
  }

  onPointerMove(e: PointerEvent) {
    if (this.isPointerDown && !this.isDragging) {
      this.hoveredStall.set(undefined);
      this.clickedStall.set(undefined);
      this.drawStall();
    }

    this.isDragging = true;
    if (this.isPointerDown && this.isDragging) {
      this.hoveredStall.set(undefined);
      this.bookmarkPopover.op.hide();
      return;
    }

    const hoveredStall = this.getMappingStall(e);
    const last = this.hoveredStall();
    this.hoveredStall.set(hoveredStall);

    if (hoveredStall) {
      if (hoveredStall.id != last?.id) {
        // this.cdr.detectChanges();
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

  onPointerUp(e: PointerEvent) {
    const wasDragging = this.isDragging;

    // 重置狀態
    this.isPointerDown = false;
    this.isDragging = false;

    if (wasDragging) {
      return;
    }

    let stall = this.hoveredStall();
    this.clickedStall.set(stall);

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
    this.drawStall();
  }

  // Touch 與長按相關屬性
  private isTouching = false;
  private isTouchDragging = false;
  private touchStartPos = { x: 0, y: 0 };
  private readonly TOUCH_DRAG_THRESHOLD = 8; // 手指滑動位移超過 8px 判定為拖曳
  onTouchStart(e: TouchEvent) {
    // 雙指以上 (如手勢縮放地圖)，取消長按與單指點擊
    if (e.touches.length > 1) {
      this.isTouching = false;
      this.isTouchDragging = true;
      this.hoveredStall.set(undefined);
      this.clickedStall.set(undefined);
      this.drawStall();
      return;
    }

    const touch = e.touches[0];
    this.isTouching = true;
    this.isTouchDragging = false;
    this.touchStartPos = { x: touch.clientX, y: touch.clientY };
  }

  // -------------------------------------------------------------
  // 2. Touch Move: 判斷滑動位移與取消長按
  // -------------------------------------------------------------
  onTouchMove(e: TouchEvent) {
    if (!this.isTouching || e.touches.length === 0) return;

    const touch = e.touches[0];
    const dx = Math.abs(touch.clientX - this.touchStartPos.x);
    const dy = Math.abs(touch.clientY - this.touchStartPos.y);

    // 位移超過門檻，判定為「滑動/拖曳地圖」
    if (dx > this.TOUCH_DRAG_THRESHOLD || dy > this.TOUCH_DRAG_THRESHOLD) {
      this.hoveredStall.set(undefined);
      this.clickedStall.set(undefined);

      if (this.isTouching && !this.isTouchDragging) {
        requestAnimationFrame(() => {
          this.drawStall();
        });
      }
      this.isTouchDragging = true;
      this.bookmarkPopover.op.hide();
    }
  }

  // -------------------------------------------------------------
  // 3. Touch End: 判斷是「短點擊 (Tap)」、「拖曳結束」或「長按結束」
  // -------------------------------------------------------------
  onTouchEnd(e: TouchEvent) {
    const wasDragging = this.isTouchDragging;

    // 重置 Touch 狀態
    this.isTouching = false;
    this.isTouchDragging = false;

    // 如果是長按或拖曳滑動地圖，放開時都不觸發短點擊 (Popover)
    if (wasDragging) {
      return;
    }

    // --- 以下為 Mobile 短點擊 (Tap) 邏輯 ---
    const stall = this.getMappingStall(e);
    this.clickedStall.set(stall);

    const op = this.bookmarkPopover?.op;
    if (stall) {
      requestAnimationFrame(() => {
        if (op.overlayVisible) {
          op.align();
        } else {
          op.show(e, this.opTarget.nativeElement);
        }
      });
    } else {
      op.hide();
    }
    this.drawStall();
  }

  drawStall() {
    const canvas = this.canvasRef?.nativeElement;
    if (!canvas) return;

    // 設定畫布解析度與圖片一致
    if (this.canvasWH().width != canvas.width || this.canvasWH().height != canvas.height) {
      // console.log('2');
      canvas.width = this.canvasWH().width;
      canvas.height = this.canvasWH().height;
    }

    const ctx = canvas?.getContext('2d')!;
    if (!ctx) return;

    this.loadLegendColor();

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // 設定樣式
    ctx.font = '12px Arial';
    ctx.textAlign = 'center';
    ctx.beginPath();
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
    ctx.stroke();
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
    const container = this.canvasRef?.nativeElement || (event.currentTarget as HTMLElement);
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
