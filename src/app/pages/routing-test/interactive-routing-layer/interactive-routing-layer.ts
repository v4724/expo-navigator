import {
  AfterViewInit,
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
import { Tooltip, TooltipModule } from 'primeng/tooltip';
import { CommonModule } from '@angular/common';
import { takeUntilDestroyed, toObservable, toSignal } from '@angular/core/rxjs-interop';
import { debounceTime, tap } from 'rxjs';
import { MarkedList } from 'src/app/core/interfaces/marked-stall.interface';
import { PathNode } from '../core/util';
import { RoutingLayerBase } from '../core/routing-layer-base';
import { StallService } from 'src/app/core/services/state/stall-service';
import { PopoverModule } from 'primeng/popover';
import { EditNotePopover } from './edit-note-popover/edit-note-popover';

@Component({
  selector: 'app-interactive-routing-layer',
  imports: [CommonModule, TooltipModule, PopoverModule, EditNotePopover],
  templateUrl: './interactive-routing-layer.html',
  styleUrl: './interactive-routing-layer.scss',
})
export class InteractiveRoutingLayer extends RoutingLayerBase implements OnInit, AfterViewInit {
  @ViewChild('stallCanvas') declare canvasRef: ElementRef<HTMLCanvasElement>;
  @ViewChild(EditNotePopover) editNotePopover!: EditNotePopover;
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
  private _stallService = inject(StallService);

  focusList = toSignal(this._markedStallService.focusList$);

  nodeList: PathNode[] = [];
  hoveredNode: WritableSignal<PathNode | undefined> = signal(undefined);
  currHoveredNode: WritableSignal<PathNode | undefined> = signal(undefined);
  currClickNode: WritableSignal<PathNode | undefined> = signal(undefined);

  stalls = toSignal(
    this._stallService.allStalls$,
    { initialValue: [] }, // 給予初始空陣列避免前端讀取 undefined
  );

  onPointerdown$ = toObservable(this.onPointerdownEvent);
  onPointermoveEvent$ = toObservable(this.onPointermoveEvent);
  onPointerupEvent$ = toObservable(this.onPointerupEvent);
  onPointercancelEvent$ = toObservable(this.onPointercancelEvent);
  onTouchstartEvent$ = toObservable(this.onTourchstartEvent);
  onTouchmoveEvent$ = toObservable(this.onTouchmoveEvent);
  onTouchendEvent$ = toObservable(this.onTouchendEvent);

  // highlight
  override pathLineWidth = 8; // 希望螢幕上看到的線寬 (px)
  override nodePointRadius = 10; // 希望螢幕上看到的點半徑 (px)
  override startPointRadius = 22; // 希望螢幕上看到的點半徑 (px)
  override startPointLineWidth = 6; // 希望螢幕上看到的線寬 (px)
  private highlightNodePointRadiusA = 12;
  private highlightNodePointRadiusB = 16;
  private highlightNodePointRadiusC = 30;

  constructor() {
    super();
  }

  ngOnInit() {
    this._userService.isLogin$.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((val) => {
      if (!val) {
        this.reset();
      }
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

    // 開啟/關閉顯示路徑
    this._routingStallService.togglePath$
      .pipe(
        tap((item) => {
          if (item?.id == this.focusList()?.id) {
            this.drawMap();
          }
        }),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe();

    // 該書籤:有編輯儲存
    this._markedStallService.updated$
      .pipe(
        tap((id) => {
          if (id == this.focusList()?.id) {
            this.drawMap();
          }
        }),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe();

    // 自動規劃路徑
    this._routingStallService.autoRoutingItem$
      .pipe(
        tap((item) => {
          if (item?.id == this.focusList()?.id) {
            this.drawMap(true);
          }
        }),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe();

    // 手動調整路徑
    this._routingStallService.reRoutingItem$
      .pipe(
        tap(() => this.drawMap()),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe();

    // focus的書籤
    this._markedStallService.focusList$
      .pipe(
        tap((val) => {
          this.drawMap();
        }),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe();

    // scale 改變
    this._stallMapService.mapContentScale$
      .pipe(
        debounceTime(200),
        tap((val) => {
          this.drawMap();
        }),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe();
  }

  ngAfterViewInit(): void {
    // DOM 載入後，一次性初始化並快取 canvas 與 ctx
    this.canvas = this.canvasRef.nativeElement;
    this.ctx = this.canvas.getContext('2d');
  }

  override drawMap(byAuto?: boolean) {
    this.reset();

    const ctx = this.ctx;
    if (!ctx) {
      return;
    }

    this.nodeList = [];
    const item = this.focusList();
    if (item) {
      let path;
      if (item.showPath) {
        if (byAuto) {
          path = this.autoRouting(item.list);
        } else {
          path = this.routeByOrder(item.list);
        }
        this.drawPaths(ctx, item, path);
      }
      this.drawNodeLabels(ctx, item);
      this.drawHoverNode(ctx);
    }
  }

  drawNodeLabels(ctx: CanvasRenderingContext2D, bookmark: MarkedList) {
    if (!ctx) {
      return;
    }

    const color = this.getColor(bookmark);
    ctx.globalAlpha = 1.0; // Focus 時提高透明度更亮

    // 攤位點+label
    bookmark.list.forEach((info) => {
      const p = this.getStallCenter(info);
      this.nodeList.push({ info, ...p });
      this.drawFocusNode(ctx, p);
      this.drawPathStallLabel(p, ctx, color);
    });
  }

  private drawFocusNode(ctx: CanvasRenderingContext2D, node: PathNode) {
    const actualRadius = this.nodePointRadius / this.dampedScale();
    const actualStartPointLineWidth = this.startPointLineWidth / this.dampedScale();
    ctx.beginPath();

    ctx.arc(node.x, node.y, actualRadius, 0, Math.PI * 2);
    ctx.fillStyle = '#000';
    ctx.fill();
    ctx.lineWidth = actualStartPointLineWidth; //加上白色外框增強對比度
    ctx.strokeStyle = '#FFF';

    ctx.stroke();
  }

  private drawHoverNode(ctx: CanvasRenderingContext2D) {
    // 聚焦核心：設定外發光陰影
    const bookmark = this.focusList();
    const node = this.currHoveredNode();
    if (!ctx || !bookmark || !node) {
      return;
    }

    const color = this.getColor(bookmark);
    const radiusA = this.highlightNodePointRadiusA / this.dampedScale();
    const radiusB = this.highlightNodePointRadiusB / this.dampedScale();
    const radiusC = this.highlightNodePointRadiusC / this.dampedScale();

    ctx.save();
    // A. 畫外層的光暈 (Glow Effect)
    const gradient = ctx.createRadialGradient(
      node.x,
      node.y,
      0, // 核心點
      node.x,
      node.y,
      radiusC, // 光暈最外圍
    );

    // 設定顏色與透明度衰減 (Stop 0 到 Stop 1)
    gradient.addColorStop(0, `${color}`);
    gradient.addColorStop(0.8, `${color}66`); // 20% 透明度
    gradient.addColorStop(1, `${color}00`); // 0% 完全透明

    ctx.beginPath();
    ctx.arc(node.x, node.y, radiusC, 0, Math.PI * 2); // 半徑加大到 20
    ctx.fillStyle = gradient;
    ctx.fill();

    // B. 畫外層白色邊框
    ctx.beginPath();
    ctx.arc(node.x, node.y, radiusB, 0, Math.PI * 2);
    ctx.fillStyle = '#ffffff';
    ctx.fill();

    // C. 畫核心高亮點 (例如改成鮮豔的琥珀色/紅色)
    ctx.beginPath();
    ctx.arc(node.x, node.y, radiusA, 0, Math.PI * 2);
    ctx.fillStyle = color; // Amber 高亮色
    ctx.fill();

    ctx.restore(); // 還原 ctx 狀態
  }

  private drawPathStallLabel(node: PathNode, ctx: CanvasRenderingContext2D, color: string) {
    const s = node.info;
    if (s) {
      let x = node.x;
      let y = node.y;
      const labelL = s.stall.id.length;
      const charWH = 6;
      const stallWH = charWH * 2;
      switch (s.stall.rule.bookmarkPosition) {
        case 'right':
          x = x - charWH * labelL - stallWH;
          y += charWH / 2;
          break;
        case 'left':
          x += stallWH;
          y += charWH / 2;
          break;
        case 'top':
        case 'bottom':
          x -= (charWH * labelL) / 2;
          y -= stallWH;
          break;
      }
      this.drawLabel(ctx, s.stall.id, x, y, color);
    }
  }

  isPointerDown = false;
  isDragging = false;
  onPointerDown(e: PointerEvent) {
    this.isPointerDown = true;
    this.isDragging = false; // 初始先假設
  }

  onPointerMove(e: PointerEvent) {
    this.isDragging = true;
    if ((this.isPointerDown && this.isDragging) || this.nodeList.length <= 0) {
      this.hoveredNode.set(undefined);
      this.editNotePopover.op.hide();
      return;
    }

    let foundNode = this.getMappingStall(e);

    // 狀態變更檢查 (避免重複觸發)
    if (this.hoveredNode() !== foundNode) {
      this.hoveredNode.set(foundNode);
      this.onHoverNodeChange(this.hoveredNode());
    }
  }

  onPointerUp(e: PointerEvent) {
    const wasDragging = this.isDragging;

    // 重置狀態
    this.isPointerDown = false;
    this.isDragging = false;

    if (wasDragging) {
      return;
    }

    let node = this.hoveredNode();
    this.currClickNode.set(node);
    this.cdr.detectChanges();

    const op = this.editNotePopover.op;
    if (node) {
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
      this.isTouchDragging = true;
      this.currHoveredNode.set(undefined);
      this.currClickNode.set(undefined);
      this.editNotePopover.op.hide();
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
    const foundNode = this.getMappingStall(e);
    this.currHoveredNode.set(foundNode);

    this.cdr.detectChanges();
    if (foundNode) {
      // 更新你的 opTarget (虛擬 Anchor 節點) 的位置到當前 node 的 Canvas/Screen 座標
      this.updateOpTargetPosition(foundNode);

      requestAnimationFrame(() => {
        this.tooltip?.show();
      });
    } else {
      this.tooltip?.hide();
    }
  }

  private getMappingStall(event: MouseEvent | TouchEvent) {
    const canvas = this.canvasRef?.nativeElement;
    if (!canvas) return undefined;

    const rect = canvas.getBoundingClientRect();
    if (rect.width === 0 || rect.height === 0) return undefined;

    // 1. 相容 MouseEvent 與 TouchEvent 的 clientX / clientY
    let clientX = 0;
    let clientY = 0;
    let isTouch = false;

    if (window.TouchEvent && event instanceof TouchEvent) {
      isTouch = true;
      if (event.touches.length > 0) {
        clientX = event.touches[0].clientX;
        clientY = event.touches[0].clientY;
      } else if (event.changedTouches.length > 0) {
        // 相容 touch-end 等觸控結束事件
        clientX = event.changedTouches[0].clientX;
        clientY = event.changedTouches[0].clientY;
      } else {
        return undefined;
      }
    } else {
      const mouseEvent = event as MouseEvent;
      clientX = mouseEvent.clientX;
      clientY = mouseEvent.clientY;
    }

    // 2. 將 DOM 滑鼠/觸控座標轉換為 Canvas 內部的真實座標
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    const canvasX = (clientX - rect.left) * scaleX;
    const canvasY = (clientY - rect.top) * scaleY;

    const baseDomRadius = 24;
    // (B) 手指觸控加成：Touch 裝置額外放大 1.5 倍
    const touchMultiplier = isTouch ? 1.5 : 1.0;

    // 將 DOM 顯示層面的半徑，轉換回 Canvas 的真實像素半徑
    // 取 Math.max 確保：即使地圖縮放，點擊範圍都不會小於 (baseDomRadius * scaleX)
    const effectiveDomRadius = Math.max(this.nodePointRadius, baseDomRadius) * touchMultiplier;
    const actualRadius = (effectiveDomRadius / this.dampedScale()) * scaleX;

    let minDistanceSq = actualRadius * actualRadius; // 使用半徑平方進行比對

    let foundNode: PathNode | undefined;

    // 4. 尋找碰撞範圍內距離最近的 Node
    for (const node of this.nodeList) {
      const dx = node.x - canvasX;
      const dy = node.y - canvasY;
      const distSq = dx * dx + dy * dy;

      if (distSq <= minDistanceSq) {
        minDistanceSq = distSq; // 動態縮減搜尋半徑，找出更近的點
        foundNode = node;
      }
    }

    return foundNode;
  }

  openUrl(url?: string) {
    url && window.open(url);
  }

  private popoverRafId: number | null = null;
  private onHoverNodeChange(node: PathNode | undefined): void {
    // 1. 如果 hover 的 node 沒有改變，不做任何 DOM/Popover 操作 (避免滑鼠微動時一直 align)
    if (this.currHoveredNode()?.info?.stall.id === node?.info?.stall.id) {
      return;
    }
    this.currHoveredNode.set(node);

    // 2. 取消上一次還沒執行的 rAF，防止滑鼠快速劃過時發生 Race Condition
    if (this.popoverRafId !== null) {
      cancelAnimationFrame(this.popoverRafId);
      this.popoverRafId = null;
    }

    if (node) {
      // 3. 更新你的 opTarget (虛擬 Anchor 節點) 的位置到當前 node 的 Canvas/Screen 座標
      this.updateOpTargetPosition(node);

      this.popoverRafId = requestAnimationFrame(() => {
        // 確保目標節點依然存在
        this.tooltip?.show();
        this.popoverRafId = null;
      });
    } else {
      this.tooltip?.hide();
    }
    this.drawMap();
  }

  private updateOpTargetPosition(node: PathNode): void {
    const canvas = this.canvasRef.nativeElement;

    // 取得 Canvas 元素未經 transform 縮放前的 CSS 顯示寬高 (Client Size)
    const cssWidth = canvas.clientWidth;
    const cssHeight = canvas.clientHeight;

    // 計算 Canvas 內部解析度 (2480x1754) 到 Canvas CSS 尺寸的比例
    const internalScaleX = cssWidth / canvas.width;
    const internalScaleY = cssHeight / canvas.height;

    // 直接算在 viewport 內部的 local 座標 (不需要加 rect.left / rect.top)
    const localX = node.x * internalScaleX;
    const localY = node.y * internalScaleY;

    const targetEl = this.opTarget.nativeElement as HTMLElement;
    targetEl.style.left = `${localX}px`;
    targetEl.style.top = `${localY}px`;
  }
}
