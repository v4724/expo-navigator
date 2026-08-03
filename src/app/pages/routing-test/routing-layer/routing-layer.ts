import {
  AfterViewInit,
  Component,
  ElementRef,
  input,
  InputSignal,
  OnInit,
  ViewChild,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { combineLatest, debounceTime, filter, take, tap } from 'rxjs';
import { MarkedList } from 'src/app/core/interfaces/marked-stall.interface';
import { RoutingLayerBase } from '../core/routing-layer-base';

@Component({
  selector: 'app-routing-layer',
  imports: [CommonModule],
  template: `<canvas #stallCanvas class="absolute top-0 left-0 w-full h-full pointer-events-none">
  </canvas>`,
  styleUrl: './routing-layer.scss',
})
export class RoutingLayer extends RoutingLayerBase implements OnInit, AfterViewInit {
  @ViewChild('stallCanvas') declare canvasRef: ElementRef<HTMLCanvasElement>;

  item: InputSignal<MarkedList> = input.required();

  constructor() {
    super();
  }

  ngOnInit() {
    // 開啟/關閉顯示路徑
    this._routingStallService.togglePath$
      .pipe(
        tap((toggleItem) => {
          if (toggleItem?.id !== this.item().id) return;

          this.redraw();
        }),
      )
      .subscribe();

    // 該書籤:有編輯儲存
    this._markedStallService.updated$
      .pipe(
        tap((id) => {
          if (id !== this.item().id) return;

          this.redraw();
        }),
      )
      .subscribe();

    // 自動規劃路徑
    this._routingStallService.autoRoutingItem$
      .pipe(
        tap((item) => {
          if (item?.id !== this.item().id) return;

          this.reset();
          if (item.showPath) {
            const path = this.autoRouting(item);
            this.drawMapAndPath(item, path);
            this.updateBookmarkPathOrder(item, path);
          }
        }),
      )
      .subscribe();

    // 手動調整路徑
    this._routingStallService.reRoutingItem$
      .pipe(
        tap((item) => {
          if (item?.id !== this.item().id) return;

          this.redraw();
        }),
      )
      .subscribe();

    // scale 改變
    this._stallMapService.mapContentScale$
      .pipe(
        debounceTime(200),
        tap((val) => {
          this.redraw();
        }),
      )
      .subscribe();
  }

  ngAfterViewInit() {
    // 顯示初始路徑
    combineLatest([this._routingStallService.pathFinder$])
      .pipe(
        filter(([val]) => !!val),
        take(1),
        tap(() => {
          this.redraw();
        }),
      )
      .subscribe();
  }

  redraw() {
    this.reset();
    if (this.item().showPath) {
      const path = this.routeByOrder(this.item().list);
      this.drawMapAndPath(this.item(), path);
    }
  }
}
