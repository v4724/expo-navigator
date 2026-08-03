import { inject, Injectable, signal } from '@angular/core';
import { BehaviorSubject, combineLatest, filter, finalize, map, Subject, take, tap } from 'rxjs';
import { StallService } from './stall-service';
import { MarkedList, MarkedStallInfo } from '../../interfaces/marked-stall.interface';
import { StallData } from '../../interfaces/stall.interface';
import { StallMapService } from './stall-map-service';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { PathFinder } from 'src/app/pages/routing-test/core/util';
import { MarkedStallService } from './marked-stall-service';
import { MarkedListApiService } from '../api/marked-list-api.service';
import { UserService } from './user-service';

@Injectable({
  providedIn: 'root',
})
export class RoutingStallService {
  private _togglePath = new Subject<MarkedList>();
  private _autoRoutingItem = new Subject<MarkedList>();
  private _reRoutingItem = new Subject<MarkedList>();

  private _stallService = inject(StallService);
  private _stallMapService = inject(StallMapService);
  private _markedListApiService = inject(MarkedListApiService);
  private _markedListService = inject(MarkedStallService);
  private _userService = inject(UserService);

  togglePath$ = this._togglePath.asObservable();
  autoRoutingItem$ = this._autoRoutingItem.asObservable();
  reRoutingItem$ = this._reRoutingItem.asObservable();

  private _unstoreItemIds = new Set<number>();
  unstoreItemsWithOrigOrder = new Map<number, MarkedStallInfo[]>();

  user = toSignal(this._userService.user$);

  // 路徑規劃
  pathFinder = signal<PathFinder | null>(null);
  pathFinder$ = toObservable(this.pathFinder);
  customDPR = 1;

  constructor() {
    combineLatest({ el: this._stallMapService.mapImage$, all: this._stallService.allStalls$ })
      .pipe(
        filter(({ el, all }) => !!el && all.length > 0),
        take(1),
        map(({ el, all }) => {
          if (!el) {
            return { width: 0, height: 0, all: [] };
          }

          // 考量 Retina 螢幕 DPR
          const dpr = this.customDPR > 0 ? this.customDPR : window.devicePixelRatio || 1;
          return {
            width: Math.floor(el.naturalWidth * dpr),
            height: Math.floor(el.naturalHeight * dpr),
            all,
          };
        }),
        tap(({ width, height, all }) => {
          const blockedPercentRects = all.map((stall) => {
            return stall.coords;
          });
          this.pathFinder.set(new PathFinder(width, height, blockedPercentRects));
        }),
      )
      .subscribe();

    this._markedListService.updated$
      .pipe(
        tap((id) => {
          this.removeUnstoreCache(id);
        }),
      )
      .subscribe();

    this._userService.isLogin$.subscribe((val) => {
      if (!val) {
        this._unstoreItemIds = new Set();
        this.unstoreItemsWithOrigOrder = new Map();
      }
    });
  }

  unstoredCache(id: number) {
    const find = this.unstoreItemsWithOrigOrder.get(id);
    return find;
  }

  autoRouting(item: MarkedList) {
    this._autoRoutingItem.next(item);
  }

  togglePath(item: MarkedList) {
    this._togglePath.next(item);
  }

  // 以新順序重新串接路徑 (紀錄舊順序)
  updateOrderByManual(item: MarkedList, newOrder: MarkedStallInfo[]) {
    this.addUnstoreCache(item);

    item.list = newOrder;
    this._reRoutingItem.next(item);
  }

  // 已重新規畫路徑 (紀錄舊順序)
  updateOrderAfterAuto(item: MarkedList, newOrder: MarkedStallInfo[]) {
    this.addUnstoreCache(item);

    item.list = newOrder;
  }

  restoreByCache(item: MarkedList) {
    const idSet = this._unstoreItemIds;
    const id = item.id;
    if (idSet.has(id)) {
      idSet.delete(id);
      const origOrder = this.unstoreItemsWithOrigOrder.get(id);
      item.list = origOrder ?? [];
      this._reRoutingItem.next(item);
      this.unstoreItemsWithOrigOrder.delete(id);
    }
  }

  private removeUnstoreCache(id: number) {
    const idSet = this._unstoreItemIds;
    if (idSet.has(id)) {
      idSet.delete(id);
      this.unstoreItemsWithOrigOrder.delete(id);
    }
  }

  private addUnstoreCache(item: MarkedList) {
    const idSet = this._unstoreItemIds;
    const id = item.id;
    if (!idSet.has(id)) {
      idSet.add(id);
      this.unstoreItemsWithOrigOrder.set(id, Array.from(item.list ?? []));
    }
  }
}
