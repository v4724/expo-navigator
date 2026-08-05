import { Component } from '@angular/core';
import { InteractiveLayer } from '../interactive-layer/interactive-layer';
import { RoutingLayers } from '../routing-layers/routing-layers';
import { BookmarkLayer } from '../../stalls-map/layers/bookmark-layer/bookmark-layer';
import { InteractiveRoutingLayer } from '../interactive-routing-layer/interactive-routing-layer';
import { BaseMap } from 'src/app/shared/components/base-map/base-map';

@Component({
  selector: 'app-routing-map',
  imports: [InteractiveLayer, RoutingLayers, BookmarkLayer, InteractiveRoutingLayer, BaseMap],
  templateUrl: './routing-map.html',
  styleUrl: './routing-map.scss',
})
export class RoutingMap {
  onPointerDown(e: PointerEvent) {
    // console.log('onPointerDown', e);
    this.pointerdown = e;
  }
  onPointerMove(e: PointerEvent) {
    this.pointermove = e;
    // console.log('onPointerMove', e);
  }
  onPointerUp(e: PointerEvent) {
    this.pointerup = e;
    // console.log('onPointerUp', e);
  }
  onTouchStart(e: TouchEvent) {
    this.touchstart = e;
    // console.log('onTouchStart', e);
  }
  onTouchMove(e: TouchEvent) {
    this.touchmove = e;
    // console.log('onTouchMove', e);
  }
  onTouchEnd(e: TouchEvent) {
    this.touchend = e;
    // console.log('onTouchEnd', e);
  }
  pointerdown!: PointerEvent;
  pointermove!: PointerEvent;
  pointerup!: PointerEvent;
  pointercancel!: PointerEvent;
  touchstart!: TouchEvent;
  touchmove!: TouchEvent;
  touchend!: TouchEvent;

  onMapClick!: MouseEvent;
  onMouseMove!: MouseEvent;
  onDragging = false;

  func(e: Event) {
    console.log('func', e);
  }
}
