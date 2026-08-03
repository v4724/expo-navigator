import PF from 'pathfinding';
import { StallCoords, StallData } from 'src/app/core/interfaces/stall.interface';
// 1. 定義內部 Node 結構
interface PFNode {
  x: number;
  y: number;
  walkable: boolean;
  f?: number;
  g?: number;
  h?: number;
  opened?: boolean;
  closed?: boolean;
  parent?: PFNode | null;
}

// 2. 擴充 Grid 類型，讓 TypeScript 認得 nodes 屬性
interface ExtendedGrid extends PF.Grid {
  nodes: PFNode[][];
}
export interface PathNode extends Point {
  stall?: StallData;
}
export interface Point {
  x: number;
  y: number;
}

export interface Path {
  start: PathNode;
  end: PathNode;
  path: Point[];
}
export interface CanvasCoord {
  x: number;
  y: number;
  w: number;
  h: number;
}

// A* 演算法簡化實作 logic
export class PathFinder {
  private baseGrid: PF.Grid;
  private finder: PF.AStarFinder;

  width: number = 0;
  height: number = 0;

  // cache 兩點的路徑
  cacheStallPath = new Map<string, Map<String, Path>>();

  constructor(width: number, height: number, blockedPercentRects: Array<StallCoords>) {
    this.width = width;
    this.height = height;
    // 1. 初始化 pathfinding 的 Grid 物件 (預設全部可通行)
    this.baseGrid = new PF.Grid(width, height);

    const blockedRects = blockedPercentRects.map((coord) => {
      return this.getCanvasCoord(coord);
    });
    // 2. 將所有攤位矩形範圍設為不可通行 (false)
    blockedRects.forEach((rect) => {
      for (let y = rect.y; y < rect.y + rect.h; y++) {
        for (let x = rect.x; x < rect.x + rect.w; x++) {
          // 加上邊界檢查，避免超出網格大小
          const tX = Math.floor(x);
          const tY = Math.floor(y);
          if (tX >= 0 && tX < width && tY >= 0 && tY < height) {
            this.baseGrid.setWalkableAt(tX, tY, false);
          }
        }
      }
    });

    // 3. 初始化 A* 尋路器
    // 預設允許斜向走 (allowDiagonal: true)；如果場館走道希望只能走直角，改為 false
    this.finder = new PF.AStarFinder({
      allowDiagonal: false, // 展場走道通常建議設 false (棋盤式走法)
      dontCrossCorners: true,
    });
  }

  // A* 尋路 API (可使用套件如 pathfinding.js)
  findPath(start: PathNode, end: PathNode): Path {
    const gridClone = this.baseGrid;

    let cachePath;
    if (start.stall && end.stall) {
      cachePath = this.getCachePath(start.stall, end.stall);
    }

    if (cachePath) return cachePath;

    const sX = Math.floor(start.x);
    const sY = Math.floor(start.y);
    const eX = Math.floor(end.x);
    const eY = Math.floor(end.y);

    if (sX >= this.width || sY >= this.height || eX > this.width || eY > this.height) {
      return { start: { x: sX, y: sY }, end: { x: eX, y: eY }, path: [] };
    }

    // 不再 clone()，直接在原本共用的 baseGrid 上做清空重置
    this.resetGrid(this.baseGrid);

    // 2. 執行尋路，取得原始格式： [[x0, y0], [x1, y1], [x2, y2], ...]
    const rawPath = this.finder.findPath(sX, sY, eX, eY, gridClone);

    // 3. 將套件回傳的二次元陣列格式轉換回你的 Point[] ({x, y}) 格式
    const path = {
      start: { x: sX, y: sY, stall: start.stall },
      end: { x: eX, y: eY, stall: end.stall },
      path: rawPath.map(([x, y]) => ({ x, y })),
    };

    if (start.stall && end.stall) {
      this.setCachePath(start.stall, end.stall, path);
    }

    return path;
  }

  planFullRoute(startPt: PathNode, bookmarkPts: PathNode[]): Array<Path> {
    let current = startPt;
    let unvisited = [...bookmarkPts];
    const arr: Array<Path> = [];

    while (unvisited.length > 0) {
      // 找出距離當前點最近的下一站愛心
      let nearestIdx = 0;
      let minDistance = Infinity;

      unvisited.forEach((pt, index) => {
        const dist = Math.hypot(pt.x - current.x, pt.y - current.y);
        if (dist < minDistance) {
          minDistance = dist;
          nearestIdx = index;
        }
      });

      const nextTarget = unvisited[nearestIdx];

      // 計算單段 A* 路徑
      const segment = this.findPath(current, nextTarget);
      arr.push(segment);

      // 更新狀態
      current = nextTarget;
      unvisited.splice(nearestIdx, 1);
    }

    return arr;
  }

  // 將百分比座標轉換為畫布像素座標
  getCanvasCoord(coords: StallCoords): CanvasCoord {
    const x = (coords.left / 100) * this.width;
    const y = (coords.top / 100) * this.height;
    const w = (coords.width / 100) * this.width;
    const h = (coords.height / 100) * this.height;

    return { x, y, w, h };
  }

  private getCachePath(a: StallData, b: StallData) {
    let path;
    const map = this.cacheStallPath.get(a.id);
    if (map) {
      path = map.get(b.id);
    }
    return path;
  }

  private setCachePath(a: StallData, b: StallData, path: Path) {
    let map = this.cacheStallPath.get(a.id);
    if (!map) {
      map = new Map();
      this.cacheStallPath.set(a.id, map);
    }
    map.set(b.id, path);
  }

  // 寫一個重置 Grid 狀態的 Helper Function
  private resetGrid(grid: PF.Grid) {
    const nodes = (grid as ExtendedGrid).nodes;

    for (let y = 0; y < this.height; y++) {
      for (let x = 0; x < this.width; x++) {
        const node = nodes[y][x];
        node.f = 0;
        node.g = 0;
        node.h = 0;
        node.opened = false;
        node.closed = false;
        node.parent = null;
      }
    }
  }
}
