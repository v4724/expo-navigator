import { AfterViewInit, Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { combineLatest, debounceTime, filter, take, takeUntil, tap } from 'rxjs';
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
            this.redraw();
          }
        }),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe();

    // 開啟/關閉顯示路徑
    this._routingStallService.togglePath$
      .pipe(
        tap(() => {
          this.redraw();
        }),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe();

    // 該書籤:有編輯儲存
    this._markedStallService.updated$
      .pipe(
        tap(() => {
          this.redraw();
        }),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe();

    // 自動規劃路徑
    this._routingStallService.autoRoutingItem$
      .pipe(
        tap((target) => {
          this.reset();
          this.bookmarkList().forEach((item) => {
            if (item.showPath) {
              let path;
              if (item.id == target.id) {
                path = this.autoRouting(item);
              } else {
                path = this.routeByOrder(item.list);
              }
              this.drawMapAndPath(item, path);
              if (item.id == target.id) {
                this.updateBookmarkPathOrder(item, path);
              }
            }
          });
        }),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe();

    // 手動調整路徑
    this._routingStallService.reRoutingItem$
      .pipe(
        tap((item) => {
          this.redraw();
        }),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe();

    // scale 改變
    this._stallMapService.mapContentScale$
      .pipe(
        debounceTime(200),
        tap((val) => {
          this.redraw();
        }),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe();
  }

  ngAfterViewInit() {}

  redraw() {
    this.reset();
    this.bookmarkList().forEach((item) => {
      if (item.showPath) {
        const path = this.routeByOrder(item.list);
        this.drawMapAndPath(item, path);
      }
    });
  }
}
