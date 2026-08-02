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
  onDragging = false;
}
