import PF from 'pathfinding';
import { MarkedStallInfo } from 'src/app/core/interfaces/marked-stall.interface';
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
  info?: MarkedStallInfo;
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

  gridWidth: number = 0;
  gridHeight: number = 0;

  pathGridScale = 10;

  // cache 兩點的路徑
  cacheStallPath = new Map<string, Map<String, Path>>();

  constructor(width: number, height: number, blockedPercentRects: Array<StallCoords>) {
    this.width = width;
    this.height = height;
    this.gridWidth = Math.floor(width / this.pathGridScale);
    this.gridHeight = Math.floor(height / this.pathGridScale);
    // 1. 初始化 pathfinding 的 Grid 物件 (預設全部可通行)
    this.baseGrid = new PF.Grid(this.gridWidth, this.gridHeight);

    const blockedRects = blockedPercentRects.map((coord) => {
      return this.getGridCoord(coord);
    });
    // 2. 將所有攤位矩形範圍設為不可通行 (false)
    blockedRects.forEach((rect) => {
      // 使用 Math.floor 與 Math.ceil 確保完整的網格涵蓋
      const startX = Math.floor(rect.x);
      const startY = Math.floor(rect.y);
      const endX = Math.ceil(rect.x + rect.w);
      const endY = Math.ceil(rect.y + rect.h);

      for (let gY = startY; gY < endY; gY++) {
        for (let gX = startX; gX < endX; gX++) {
          // 💡 正確的邊界檢查：必須比對 gridWidth 與 gridHeight！
          if (gX >= 0 && gX < this.gridWidth && gY >= 0 && gY < this.gridHeight) {
            this.baseGrid.setWalkableAt(gX, gY, false);
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
    let cachePath;
    if (start.info && end.info) {
      cachePath = this.getCachePath(start.info.stall, end.info.stall);
    }

    if (cachePath) return cachePath;

    const sX = Math.floor(start.x / this.pathGridScale);
    const sY = Math.floor(start.y / this.pathGridScale);
    const eX = Math.floor(end.x / this.pathGridScale);
    const eY = Math.floor(end.y / this.pathGridScale);

    if (
      sX < 0 ||
      sX >= this.gridWidth ||
      sY < 0 ||
      sY >= this.gridHeight ||
      eX < 0 ||
      eX >= this.gridWidth ||
      eY < 0 ||
      eY >= this.gridHeight
    ) {
      return {
        start: { x: start.x, y: start.y, info: start.info },
        end: { x: end.x, y: end.y, info: end.info },
        path: [],
      };
    }

    // 不再 clone()，直接在原本共用的 baseGrid 上清空重置
    this.resetGrid(this.baseGrid);

    this.baseGrid.setWalkableAt(sX, sY, true);
    this.baseGrid.setWalkableAt(eX, eY, true);

    // 2. 執行尋路，取得原始格式： [[x0, y0], [x1, y1], [x2, y2], ...]
    const rawPath = this.finder.findPath(sX, sY, eX, eY, this.baseGrid);

    // 3. 將套件回傳的二次元陣列格式轉換回你的 Point[] ({x, y}) 格式
    const path = {
      start: {
        x: sX * this.pathGridScale + this.pathGridScale / 2,
        y: sY * this.pathGridScale + this.pathGridScale / 2,
        stall: start.info,
      },
      end: {
        x: eX * this.pathGridScale + this.pathGridScale / 2,
        y: eY * this.pathGridScale + this.pathGridScale / 2,
        stall: end.info,
      },
      path: rawPath.map(([x, y]) => ({
        x: x * this.pathGridScale + this.pathGridScale / 2,
        y: y * this.pathGridScale + this.pathGridScale / 2,
      })),
    };

    if (start.info && end.info && rawPath.length > 0) {
      this.setCachePath(start.info.stall, end.info.stall, path);
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

  // 將百分比座標轉換為grid座標
  getGridCoord(coords: StallCoords): CanvasCoord {
    const x = (coords.left / 100) * this.gridWidth;
    const y = (coords.top / 100) * this.gridHeight;
    const w = (coords.width / 100) * this.gridWidth;
    const h = (coords.height / 100) * this.gridHeight;

    return { x, y, w, h };
  }
  // 將百分比座標轉換為canvas座標
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
    if (!this.cacheStallPath.has(a.id)) {
      this.cacheStallPath.set(a.id, new Map());
    }
    this.cacheStallPath.get(a.id)!.set(b.id, path);

    // 順便寫入反向路徑 (B -> A)
    if (!this.cacheStallPath.has(b.id)) {
      this.cacheStallPath.set(b.id, new Map());
    }
    const reversedPath: Path = {
      start: path.end, // 起點變終點
      end: path.start, // 終點變起點
      path: [...path.path].reverse(), // 陣列點倒轉
    };

    this.cacheStallPath.get(b.id)!.set(a.id, reversedPath);
  }

  // 寫一個重置 Grid 狀態的 Helper Function
  private resetGrid(grid: PF.Grid) {
    const nodes = (grid as ExtendedGrid).nodes;

    for (let y = 0; y < this.gridHeight; y++) {
      for (let x = 0; x < this.gridWidth; x++) {
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
