import { ElementRef, inject } from '@angular/core';
import { map } from 'rxjs';
import { RoutingStallService } from 'src/app/core/services/state/routing-stall-service';
import { Path, PathNode } from './util';
import { StallData } from 'src/app/core/interfaces/stall.interface';
import { toSignal } from '@angular/core/rxjs-interop';
import { MarkedList } from 'src/app/core/interfaces/marked-stall.interface';
import { MarkedStallService } from 'src/app/core/services/state/marked-stall-service';
import { StallMapService } from 'src/app/core/services/state/stall-map-service';

export class RoutingLayerBase {
  canvasRef!: ElementRef<HTMLCanvasElement>;

  protected _routingStallService = inject(RoutingStallService);
  protected _markedStallService = inject(MarkedStallService);
  protected _stallMapService = inject(StallMapService);

  protected pathFinder = toSignal(this._routingStallService.pathFinder$);
  protected canvasWH = toSignal(
    this._routingStallService.pathFinder$.pipe(
      map((pathFinder) => {
        if (pathFinder == null) {
          return { width: 0, height: 0 };
        }
        return { width: pathFinder.width, height: pathFinder.height };
      }),
    ),
    { initialValue: { width: 0, height: 0 } },
  );

  // defulat
  readonly pathLineWidth = 3; // 希望螢幕上看到的線寬 (px)
  readonly nodePointRadius = 5; // 希望螢幕上看到的點半徑 (px)
  readonly startPointRadius = 10; // 希望螢幕上看到的點半徑 (px)
  readonly startPointLineWidth = 2; // 希望螢幕上看到的線寬 (px)

  // highlight
  readonly pathHighlightLineBlur = 12; // 希望螢幕上看到的線寬 (px)
  readonly pathHighlightLineWidth = 4; // 希望螢幕上看到的線寬 (px)
  readonly nodePointHighlightRadius = 6; // 希望螢幕上看到的點半徑 (px)
  readonly startPointHighlightRadius = 10; // 希望螢幕上看到的點半徑 (px)
  readonly startPointHighlightLineWidth = 2; // 希望螢幕上看到的線寬 (px)

  constructor() {}

  get baseMapScale() {
    return this._stallMapService.mapContentScale;
  }

  protected drawMapAndPath(bookmark: MarkedList, paths: Path[]) {
    const canvas = this.canvasRef?.nativeElement;
    const ctx = canvas?.getContext('2d')!;
    if (!ctx) {
      return;
    }

    if (paths.length < 2) return;

    const actualLineWidth = this.pathLineWidth / this.baseMapScale;
    const actualRadius = this.nodePointRadius / this.baseMapScale;
    const actualStartRadius = this.startPointRadius / this.baseMapScale;
    const actualStartPointLineWidth = this.startPointLineWidth / this.baseMapScale;

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

    ctx.globalAlpha = 1; // 設定整體透明度
    ctx.strokeStyle = color;
    ctx.lineWidth = actualLineWidth;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.stroke();

    // 畫起點
    ctx.beginPath();
    ctx.arc(paths[0].start.x, paths[0].start.y, actualStartRadius, 0, Math.PI * 2);
    ctx.fillStyle = color;
    ctx.fill();
    ctx.lineWidth = actualStartPointLineWidth; //加上白色外框增強對比度
    ctx.strokeStyle = '#FFFFFF';
    ctx.stroke();

    // 攤位點
    paths.forEach((p) => {
      ctx.beginPath();
      ctx.arc(p.start.x, p.start.y, actualRadius, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
    });
    const endP = paths[paths.length - 1];
    ctx.beginPath();
    ctx.arc(endP.end.x, endP.end.y, actualRadius, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
  }

  protected reset() {
    const canvas = this.canvasRef?.nativeElement;
    const ctx = canvas?.getContext('2d')!;

    if (!ctx) return;

    // 畫布像素設定為 原始圖片寬高 × DPR
    canvas.width = this.canvasWH().width;
    canvas.height = this.canvasWH().height;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
  }

  // 💡 繪製文字的輔助函式（包含描邊防干擾）
  protected drawLabel(
    ctx: CanvasRenderingContext2D,
    text: string,
    x: number,
    y: number,
    color: string = '#000000',
  ) {
    if (!ctx) {
      return;
    }

    // 1. 繪製文字白色外框（防止文字與背景地圖混在一起）
    ctx.strokeStyle = '#FFFFFF';
    ctx.lineWidth = 3;
    ctx.lineJoin = 'round';
    ctx.strokeText(text, x, y);

    // 2. 繪製文字本體
    ctx.fillStyle = color;
    ctx.fillText(text, x, y);

    ctx.restore();
  }

  protected routeByOrder(list: StallData[]): Path[] {
    let routingPath: Path[] = [];
    for (let i = 1; i < list.length; i++) {
      const last = this.getStallCenter(list[i - 1]);
      const curr = this.getStallCenter(list[i]);
      const p = this.pathFinder()?.findPath(last, curr);
      if (p && p.path.length > 0) {
        routingPath.push(p);
      } else {
        console.warn(`路徑出錯查無此路線 ${list[i - 1].id} > ${list[i].id}`);
      }
    }
    return routingPath;
  }

  protected autoRouting(bookmark: MarkedList): Path[] {
    if (bookmark.list.length < 1) {
      return [];
    }
    let pathNodes = bookmark.list.map((stall) => {
      const { x, y } = this.getStallCenter(stall);
      return { stall, x, y } as PathNode;
    });
    const start = pathNodes[0];
    pathNodes.splice(0, 1);

    const routingPath = this.pathFinder()?.planFullRoute(start, pathNodes) ?? [];
    return routingPath;
  }

  // 調整路線規劃時所對應的攤位中心點位置
  protected getStallCenter(s: StallData): PathNode {
    const pathFinder = this.pathFinder();
    const orig =
      pathFinder != null ? pathFinder.getCanvasCoord(s.coords) : { x: 0, y: 0, w: 0, h: 0 };
    let x, y;
    switch (s.rule.bookmarkPosition) {
      case 'right':
        x = orig.x + orig.w * 1.2;
        y = orig.y + orig.h / 2;
        break;
      case 'left':
        x = orig.x - orig.w * 0.2;
        y = orig.y + orig.h / 2;
        break;
      case 'top':
        y = orig.y - orig.h * 0.2;
        x = orig.x + orig.w / 2;
        break;
      case 'bottom':
        y = orig.y + orig.h * 1.2;
        x = orig.x + orig.w / 2;
        break;
    }
    return { ...orig, x, y, stall: s };
  }

  protected updateBookmarkPathOrder(item: MarkedList, paths: Path[]) {
    let end: StallData | undefined;
    const order = paths
      .map((path) => {
        end = path.end.stall;
        return path.start.stall;
      })
      .filter((val) => !!val);
    if (end) {
      order.push(end);
    }

    this._routingStallService.updateOrderAfterAuto(item, order);
  }
}
