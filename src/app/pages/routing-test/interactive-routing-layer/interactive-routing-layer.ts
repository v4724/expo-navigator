import {
  ChangeDetectorRef,
  Component,
  ElementRef,
  inject,
  OnInit,
  signal,
  ViewChild,
  WritableSignal,
} from '@angular/core';
import { StallData } from 'src/app/core/interfaces/stall.interface';
import { Tooltip, TooltipModule } from 'primeng/tooltip';
import { CommonModule } from '@angular/common';
import { StallBookmarkPopover } from '../../../shared/components/bookmark/stall-bookmark-popover/stall-bookmark-popover';
import { toSignal } from '@angular/core/rxjs-interop';
import { debounceTime, tap } from 'rxjs';
import { MarkedList } from 'src/app/core/interfaces/marked-stall.interface';
import { Path, PathNode } from '../core/util';
import { RoutingLayerBase } from '../core/routing-layer-base';
import { StallService } from 'src/app/core/services/state/stall-service';
import { UserService } from 'src/app/core/services/state/user-service';

@Component({
  selector: 'app-interactive-routing-layer',
  imports: [CommonModule, TooltipModule, StallBookmarkPopover],
  templateUrl: './interactive-routing-layer.html',
  styleUrl: './interactive-routing-layer.scss',
})
export class InteractiveRoutingLayer extends RoutingLayerBase implements OnInit {
  @ViewChild('stallCanvas') declare canvasRef: ElementRef<HTMLCanvasElement>;
  @ViewChild(StallBookmarkPopover) bookmarkPopover!: StallBookmarkPopover;
  @ViewChild('opTarget') opTarget!: ElementRef<HTMLDivElement>;
  @ViewChild(Tooltip, { read: Tooltip }) tooltip!: Tooltip;

  private cdr = inject(ChangeDetectorRef);
  private _stallService = inject(StallService);
  private _userService = inject(UserService);

  focusList = toSignal(this._markedStallService.focusList$);

  hoveredStall: WritableSignal<StallData | undefined> = signal(undefined);
  clickedStall: WritableSignal<StallData | undefined> = signal(undefined);

  stalls = toSignal(
    this._stallService.allStalls$,
    { initialValue: [] }, // 給予初始空陣列避免前端讀取 undefined
  );
  constructor() {
    super();
  }

  ngOnInit() {
    this._userService.isLogin$.subscribe((val) => {
      if (!val) {
        this.reset();
      }
    });

    // 開啟/關閉顯示路徑
    this._routingStallService.togglePath$.pipe(tap((item) => this.redraw(item))).subscribe();

    // 該書籤:有編輯儲存
    this._markedStallService.updated$
      .pipe(
        tap((id) => {
          const focusList = this.focusList();
          if (id == focusList?.id) {
            this.redraw(focusList);
          }
        }),
      )
      .subscribe();

    // 自動規畫路徑
    this._routingStallService.autoRoutingItem$
      .pipe(
        tap((item) => {
          this.redraw(item, true);
        }),
      )
      .subscribe();

    // 手動調整路徑
    this._routingStallService.reRoutingItem$.pipe(tap((item) => this.redraw(item))).subscribe();

    // focus的書籤
    this._markedStallService.focusList$.pipe(tap((item) => this.redraw(item))).subscribe();

    // scale 改變
    this._stallMapService.mapContentScale$
      .pipe(
        debounceTime(200),
        tap((val) => {
          this.redraw(this.focusList());
        }),
      )
      .subscribe();
  }

  redraw(item: MarkedList | undefined, byAuto?: boolean) {
    this.reset();
    if (item && item.showPath && item.id == this.focusList()?.id) {
      let path;
      if (byAuto) {
        path = this.autoRouting(item);
      } else {
        path = this.routeByOrder(item.list);
      }
      this.drawFocusPath(item, path);
    }
  }

  drawFocusPath(bookmark: MarkedList, paths: Array<Path>) {
    const canvas = this.canvasRef?.nativeElement;
    const ctx = canvas?.getContext('2d')!;

    if (!ctx) {
      return;
    }

    if (paths.length < 2) return;

    // 除以外層的 CSS Scale 進行反向抵銷
    const actualLineBlur = this.pathHighlightLineBlur / this.baseMapScale;
    const actualLineWidth = this.pathHighlightLineWidth / this.baseMapScale;
    const actualRadius = this.nodePointHighlightRadius / this.baseMapScale;
    const actualStartRadius = this.startPointHighlightRadius / this.baseMapScale;
    const actualStartPointLineWidth = this.startPointHighlightLineWidth / this.baseMapScale;

    // 繪製規劃路線
    ctx.beginPath();
    paths.forEach((p) => {
      const path = p.path;
      ctx.moveTo(path[0].x, path[0].y);
      for (let i = 1; i < path.length; i++) {
        ctx.lineTo(path[i].x, path[i].y);
      }
    });

    const color = bookmark.isCusIconColor
      ? bookmark.cusIconColor
      : (bookmark.iconColor ?? '#FF0000');

    // 💡 聚焦核心：設定外發光陰影
    ctx.shadowColor = color; // 陰影顏色與主線同色或用純白/黃色高亮
    ctx.shadowBlur = actualLineBlur; // 發光擴散範圍 (值越大越模糊擴散)
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 0;

    ctx.globalAlpha = 1.0; // Focus 時提高透明度更亮
    ctx.strokeStyle = color;
    ctx.lineWidth = actualLineWidth; // 稍微加粗主線條 (原 3 -> 4)
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.stroke();

    // 攤位點+label
    paths.forEach((p) => {
      ctx.beginPath();

      ctx.arc(p.start.x, p.start.y, actualRadius, 0, Math.PI * 2);
      ctx.fillStyle = '#000';
      ctx.fill();
      ctx.lineWidth = actualStartPointLineWidth; //加上白色外框增強對比度
      ctx.strokeStyle = '#FFF';
      ctx.stroke();

      this.drawPathStallLabel(p.start, ctx);
    });
    const endP = paths[paths.length - 1];
    ctx.beginPath();
    ctx.arc(endP.end.x, endP.end.y, actualRadius, 0, Math.PI * 2);
    ctx.fillStyle = '#000';
    ctx.fill();
    ctx.lineWidth = actualStartPointLineWidth; //加上白色外框增強對比度
    ctx.strokeStyle = 'FFF';
    ctx.stroke();

    this.drawPathStallLabel(endP.end, ctx);

    // 畫起點
    ctx.beginPath();
    ctx.arc(paths[0].start.x, paths[0].start.y, actualStartRadius, 0, Math.PI * 2);
    ctx.fillStyle = color;
    ctx.fill();
    ctx.lineWidth = actualStartPointLineWidth; //加上白色外框增強對比度
    ctx.strokeStyle = '#FFFFFF';
    ctx.stroke();

    ctx.restore();
  }

  private drawPathStallLabel(node: PathNode, ctx: CanvasRenderingContext2D) {
    const s = node.stall;
    if (s) {
      let x = node.x;
      let y = node.y;
      const labelL = s.id.length;
      const charWH = 6;
      const stallWH = charWH * 2;
      switch (s.rule.bookmarkPosition) {
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
      this.drawLabel(ctx, s.id, x, y, '#000');
    }
  }

  onMapClick(event: MouseEvent) {}

  onMouseMove(event: MouseEvent) {}
}
