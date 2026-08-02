import { inject, Injectable, signal } from '@angular/core';
import { BehaviorSubject, combineLatest, filter, finalize, map, take, tap } from 'rxjs';
import { StallService } from './stall-service';
import { MarkedList } from '../../interfaces/marked-stall.interface';
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
  private _routingStalls = new BehaviorSubject<StallData[]>([]);
  private _togglePath = new BehaviorSubject<MarkedList | null>(null);
  private _autoRoutingItem = new BehaviorSubject<MarkedList | null>(null);
  private _reRoutingItem = new BehaviorSubject<MarkedList | null>(null);

  private _stallService = inject(StallService);
  private _stallMapService = inject(StallMapService);
  private _markedListApiService = inject(MarkedListApiService);
  private _markedListService = inject(MarkedStallService);
  private _userService = inject(UserService);

  routingStalls$ = this._routingStalls.asObservable();
  togglePath$ = this._togglePath.asObservable();
  autoRoutingItem$ = this._autoRoutingItem.asObservable();
  reRoutingItem$ = this._reRoutingItem.asObservable();

  user = toSignal(this._userService.user$);

  // 路徑規劃
  pathFinder = signal<PathFinder | null>(null);
  pathFinder$ = toObservable(this.pathFinder);
  customDPR = 0.5;

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
  }

  autoRouting(item: MarkedList) {
    this._autoRoutingItem.next(item);
  }

  togglePath(item: MarkedList) {
    this._togglePath.next(item);
  }

  // 以新順序重新串接路徑 (同時 API 更新順序)
  updateOrderByManual(item: MarkedList, newOrder: StallData[]) {
    item.list = newOrder;
    item.isUpdating = true;

    this._reRoutingItem.next(item);

    const dto = this._markedListApiService.transformToDto(item);
    this._markedListApiService
      .update(item.id, this.user()?.acc!, dto)
      .pipe(
        finalize(() => {
          item.isUpdating = false;
        }),
      )
      .subscribe((res) => {
        if (res.success) {
          this._markedListService.update(dto);
        }
      });
  }

  // 已重新規畫路徑 (一併 API 更新順序)
  updateOrderAfterAuto(item: MarkedList, newOrder: StallData[]) {
    item.list = newOrder;
    item.isUpdating = true;

    const dto = this._markedListApiService.transformToDto(item);
    this._markedListApiService
      .update(item.id, this.user()?.acc!, dto)
      .pipe(
        finalize(() => {
          item.isUpdating = false;
        }),
      )
      .subscribe((res) => {
        if (res.success) {
          this._markedListService.update(dto);
        }
      });
  }
}
