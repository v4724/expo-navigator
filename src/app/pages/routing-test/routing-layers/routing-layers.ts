import { AfterViewInit, Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { combineLatest, debounceTime, tap } from 'rxjs';
import { RoutingLayerBase } from '../core/routing-layer-base';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-routing-layers',
  imports: [CommonModule],
  template: `<canvas #stallCanvas class="absolute top-0 left-0 w-full h-full pointer-events-none">
  </canvas>`,
  styleUrl: './routing-layers.scss',
})
export class RoutingLayers extends RoutingLayerBase implements OnInit, AfterViewInit {
  @ViewChild('stallCanvas') declare canvasRef: ElementRef<HTMLCanvasElement>;

  bookmarkList = toSignal(this._markedStallService.markedList$, { initialValue: [] });

  constructor() {
    super();
  }

  ngOnInit() {
    combineLatest([this._userService.isLogin$, this._routingStallService.pathFinder$])
      .pipe(
        tap(([login, val]) => {
          if (!login) {
            this.reset();
          } else if (login && !!val) {
            this.drawMap();
          }
        }),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe();

    // 開啟/關閉顯示路徑
    this._routingStallService.togglePath$
      .pipe(
        tap(() => {
          this.drawMap();
        }),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe();

    // 該書籤:有編輯儲存
    this._markedStallService.updated$
      .pipe(
        tap(() => {
          this.drawMap();
        }),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe();

    // 自動規劃路徑
    this._routingStallService.autoRoutingItem$
      .pipe(
        tap((target) => {
          this.drawPathAndAutoPath(target.id);
        }),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe();

    // 手動調整路徑
    this._routingStallService.reRoutingItem$
      .pipe(
        tap((item) => {
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

  ngAfterViewInit() {
    // DOM 載入後，一次性初始化並快取 canvas 與 ctx
    this.canvas = this.canvasRef.nativeElement;
    this.ctx = this.canvas.getContext('2d');
  }

  override drawMap() {
    this.reset();
    const ctx = this.ctx;
    if (!ctx) {
      return;
    }

    this.bookmarkList().forEach((item) => {
      if (item.showPath) {
        const path = this.routeByOrder(item.list);
        this.drawPaths(ctx, item, path);
      }
    });
  }

  private drawPathAndAutoPath(autoTargetId: number) {
    this.reset();
    const ctx = this.ctx;
    if (!ctx) {
      return;
    }
    this.bookmarkList().forEach((item) => {
      if (item.showPath) {
        let path;
        if (item.id == autoTargetId) {
          path = this.autoRouting(item.list);
        } else {
          path = this.routeByOrder(item.list);
        }
        this.drawPaths(ctx, item, path);

        if (item.id == autoTargetId) {
          this.updateBookmarkPathOrder(item, path);
        }
      }
    });
  }
}
