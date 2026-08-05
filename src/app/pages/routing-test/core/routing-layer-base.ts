import { DestroyRef, ElementRef, inject } from '@angular/core';
import { map } from 'rxjs';
import { RoutingStallService } from 'src/app/core/services/state/routing-stall-service';
import { Path, PathNode } from './util';
import { toSignal } from '@angular/core/rxjs-interop';
import { MarkedList, MarkedStallInfo } from 'src/app/core/interfaces/marked-stall.interface';
import { MarkedStallService } from 'src/app/core/services/state/marked-stall-service';
import { StallMapService } from 'src/app/core/services/state/stall-map-service';
import { UserService } from 'src/app/core/services/state/user-service';

export class RoutingLayerBase {
  canvasRef!: ElementRef<HTMLCanvasElement>;

  protected _routingStallService = inject(RoutingStallService);
  protected _markedStallService = inject(MarkedStallService);
  protected _stallMapService = inject(StallMapService);
  protected _userService = inject(UserService);
  protected destroyRef = inject(DestroyRef);

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

  dampedScale = toSignal(
    this._stallMapService.mapContentScale$.pipe(
      map((val) => {
        return Math.sqrt(val);
      }),
    ),
    { initialValue: 1 },
  );

  // 將 ctx 快取在 class 屬性中
  protected canvas!: HTMLCanvasElement;
  protected ctx: CanvasRenderingContext2D | null = null;

  // defulat
  protected pathLineWidth = 4; // 希望螢幕上看到的線寬 (px)
  protected nodePointRadius = 10; // 希望螢幕上看到的點半徑 (px)
  protected startPointRadius = 16; // 希望螢幕上看到的點半徑 (px)
  protected startPointLineWidth = 6; // 希望螢幕上看到的線寬 (px)

  constructor() {}

  get baseMapScale() {
    return this._stallMapService.mapContentScale;
  }

  drawMap() {
    this.reset();

    const ctx = this.ctx;
    if (!ctx) {
      return;
    }
  }

  protected reset() {
    const canvas = this.canvasRef?.nativeElement;
    if (!canvas) return;

    // 畫布像素設定為 原始圖片寬高
    if (this.canvasWH().width != canvas.width || this.canvasWH().height != canvas.height) {
      // console.log('1');
      canvas.width = this.canvasWH().width;
      canvas.height = this.canvasWH().height;

      this.canvas = canvas;
      this.ctx = canvas.getContext('2d');
    }

    this.ctx?.clearRect(0, 0, canvas.width, canvas.height);
  }

  protected drawPaths(ctx: CanvasRenderingContext2D, bookmark: MarkedList, paths: Path[]) {
    if (!ctx) {
      return;
    }

    if (paths.length < 2) return;

    // 繪製規劃路線
    const actualLineWidth = this.pathLineWidth / this.dampedScale();
    const color = this.getColor(bookmark);

    ctx.beginPath();
    paths.forEach((p) => {
      const path = p.path;
      ctx.moveTo(path[0].x, path[0].y);
      for (let i = 1; i < path.length; i++) {
        ctx.lineTo(path[i].x, path[i].y);
      }
    });

    ctx.globalAlpha = 1; // 設定整體透明度
    ctx.strokeStyle = color;
    ctx.lineWidth = actualLineWidth;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.stroke();
  }

  protected drawStartPoint(ctx: CanvasRenderingContext2D, bookmark: MarkedList, node: PathNode) {
    // 畫起點
    const actualStartRadius = this.startPointRadius / this.dampedScale();
    const actualStartPointLineWidth = this.startPointLineWidth / this.dampedScale();
    const color = this.getColor(bookmark);

    ctx.beginPath();
    ctx.arc(node.x, node.y, actualStartRadius, 0, Math.PI * 2);
    ctx.fillStyle = color;
    ctx.fill();
    ctx.lineWidth = actualStartPointLineWidth; //加上白色外框增強對比度
    ctx.strokeStyle = '#FFFFFF';

    ctx.stroke();
  }

  // 💡 繪製文字的輔助函式（包含描邊防干擾）
  protected drawLabel(
    ctx: CanvasRenderingContext2D,
    text: string,
    x: number,
    y: number,
    color: string,
  ) {
    if (!ctx) {
      return;
    }

    ctx.beginPath();
    ctx.font = '600 20px "Inter", "Roboto", "Segoe UI", sans-serif';
    // 1. 多層 strokeText：由外向內繪製，塑造漸層擴散質感
    // 最外層
    ctx.strokeStyle = `${color}26`; // 15% 透明度
    ctx.lineWidth = 28 / this.dampedScale();
    ctx.strokeText(text, x, y);

    // 中間層
    ctx.strokeStyle = `${color}66`; // 40% 透明度
    ctx.lineWidth = 16 / this.dampedScale();
    ctx.strokeText(text, x, y);

    // 1. 繪製文字白色外框（防止文字與背景地圖混在一起）
    ctx.strokeStyle = '#FFFFFF';
    ctx.lineWidth = 4;
    ctx.lineJoin = 'round';
    ctx.strokeText(text, x, y);

    // 2. 繪製文字本體
    ctx.fillStyle = '#000000';
    ctx.fillText(text, x, y);

    ctx.restore();
  }

  protected routeByOrder(list: MarkedStallInfo[]): Path[] {
    let routingPath: Path[] = [];
    for (let i = 1; i < list.length; i++) {
      const last = this.getStallCenter(list[i - 1]);
      const curr = this.getStallCenter(list[i]);
      const p = this.pathFinder()?.findPath(last, curr);
      if (p && p.path.length > 0) {
        routingPath.push(p);
      } else {
        console.warn(`路徑出錯查無此路線 ${list[i - 1].stall.id} > ${list[i].stall.id}`);
      }
    }
    return routingPath;
  }

  protected autoRouting(list: MarkedStallInfo[]): Path[] {
    if (list.length < 1) {
      return [];
    }
    let pathNodes = list.map((item) => {
      const { x, y } = this.getStallCenter(item);
      return { info: item, x, y } as PathNode;
    });
    const start = pathNodes[0];
    pathNodes.splice(0, 1);

    const routingPath = this.pathFinder()?.planFullRoute(start, pathNodes) ?? [];
    return routingPath;
  }

  // 調整路線規劃時所對應的攤位中心點位置
  protected getStallCenter(info: MarkedStallInfo): PathNode {
    const s = info.stall;
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
    return { ...orig, x, y, info };
  }

  protected updateBookmarkPathOrder(item: MarkedList, paths: Path[]) {
    let end: MarkedStallInfo | undefined;
    const order = paths
      .map((path) => {
        end = path.end.info;
        return path.start.info;
      })
      .filter((val) => !!val);
    if (end) {
      order.push(end);
    }

    this._routingStallService.updateOrderAfterAuto(item, order);
  }

  protected getColor(bookmark: MarkedList) {
    return (bookmark.isCusIconColor ? bookmark.cusIconColor : bookmark.iconColor) || '#64748b';
  }
}
