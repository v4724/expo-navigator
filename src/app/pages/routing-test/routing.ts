import { Component, computed, ElementRef, inject, signal, ViewChild } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ExpoStateService } from 'src/app/core/services/state/expo-state-service';
import { StallMapService } from 'src/app/core/services/state/stall-map-service';
import { BookmarkLayer } from '../stalls-map/layers/bookmark-layer/bookmark-layer';
import { RoutingLayers } from './routing-layers/routing-layers';
import { CreateMarkedListBtn } from 'src/app/shared/components/marked-list/create-marked-list-btn/create-marked-list-btn';
import { BookmarkList } from 'src/app/shared/components/marked-list/bookmark-list/bookmark-list';
import { TooltipModule } from 'primeng/tooltip';
import { ButtonModule } from 'primeng/button';
import { RouterModule } from '@angular/router';
import { BaseMap } from 'src/app/shared/components/base-map/base-map';
import { InteractiveLayer } from './interactive-layer/interactive-layer';
import { InteractiveRoutingLayer } from './interactive-routing-layer/interactive-routing-layer';

@Component({
  selector: 'app-routing',
  imports: [
    BookmarkLayer,
    RoutingLayers,
    CreateMarkedListBtn,
    BookmarkList,
    ButtonModule,
    TooltipModule,
    RouterModule,
    BaseMap,
    InteractiveLayer,
    InteractiveRoutingLayer,
  ],
  templateUrl: './routing.html',
  styleUrl: './routing.scss',
})
export class Routing {
  @ViewChild('mapContent') mapContent!: ElementRef<HTMLDivElement>;
  private _expoStateService = inject(ExpoStateService);
  private _stallMapService = inject(StallMapService);

  mapImgSrc = toSignal(this._expoStateService.mapImageUrl$);

  // 圖片比例
  private imageHeightToWidthRatio = signal<number>(0);
  imageAspectRatio = computed(() => {
    const ratio = this.imageHeightToWidthRatio();
    // Provide the calculated width/height ratio, or a default 1/1 square until the image loads.
    return ratio > 0 ? 1 / ratio : 1;
  });

  mapWidth = signal<number>(0);
  mapHeight = signal<number>(0);

  getRatioXY(x: number, y: number) {
    return { x: (x / this.mapWidth()) * 100, y: (y / this.mapHeight()) * 100 };
  }

  onMapImageLoad(event: Event) {
    const img = event.target as HTMLImageElement;
    const { naturalWidth, naturalHeight } = img;
    if (naturalWidth > 0) {
      this.imageHeightToWidthRatio.set(naturalHeight / naturalWidth);
    }
    requestAnimationFrame(() => {
      const w = img.offsetWidth;
      const h = img.offsetHeight;
      this.mapWidth.set(w);
      this.mapHeight.set(h);

      this._stallMapService.mapImage = img;
      this._stallMapService.mapContentWH = {
        w: w,
        h: h,
      };
    });
  }
}
