import { CommonModule } from '@angular/common';
import {
  AfterViewInit,
  Component,
  ElementRef,
  inject,
  OnDestroy,
  OnInit,
  signal,
  viewChildren,
} from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { map } from 'rxjs';
import { AreaService } from 'src/app/core/services/state/area-service';
import { StallMapService } from 'src/app/core/services/state/stall-map-service';
import { StallService } from 'src/app/core/services/state/stall-service';
import { UiStateService } from 'src/app/core/services/state/ui-state-service';
import { StallsCanvas } from '../layers/stalls-canvas/stalls-canvas';
import { InteractiveLayer } from '../layers/interactive-layer/interactive-layer';
import { SearchLayer } from '../layers/search-layer/search-layer';
import { TooltipModule } from 'primeng/tooltip';
import { WishlistLayer } from '../layers/wishlist-layer/wishlist-layer';
import { BookmarkLayer } from '../layers/bookmark-layer/bookmark-layer';
import { BaseMap } from 'src/app/shared/components/base-map/base-map';

@Component({
  selector: 'app-map',
  imports: [
    CommonModule,
    StallsCanvas,
    InteractiveLayer,
    SearchLayer,
    TooltipModule,
    BaseMap,
    WishlistLayer,
    BookmarkLayer,
  ],
  templateUrl: './map.html',
  styleUrl: './map.scss',
})
export class Map implements OnInit, AfterViewInit, OnDestroy {
  zoneElements = viewChildren<ElementRef<HTMLDivElement>>('zoneLabel');

  private _stallMapService = inject(StallMapService);
  private _areaService = inject(AreaService);
  private _uiStateService = inject(UiStateService);
  private _stallService = inject(StallService);

  mapWidth = signal<number>(0);
  mapHeight = signal<number>(0);

  // 攤位
  allStalls$ = this._stallService.allStalls$;
  stallZoneDef = toSignal(
    this._stallService.stallZoneDef$.pipe(
      map((def) => {
        return Array.from(def.values() ?? []);
      }),
    ),
  );

  // 場內 only 圖層
  // showAreas = toSignal(this._areaService.show$);
  // selectedAreasId = toSignal(this._areaService.selectedAreasId$, {
  //   initialValue: new Set<string>(),
  // });
  // selectedAreas = computed(() => {
  //   const mapW = this.mapWidth();
  //   const mapH = this.mapHeight();
  //   if (!mapW || !mapH) {
  //     return [];
  //   }
  //   const data: Area[] = [];
  //   this.selectedAreasId().forEach((id: string) => {
  //     const area = this._areaService.toArea(mapW, mapH, id);
  //     area && data.push(area);
  //   });
  //   return data;
  // });

  // 區域標示
  // stallZoneDefMap = toSignal(this._stallService.stallZoneDef$);
  // anchorZones = computed(() => {
  //   return (this.stallZoneDef() ?? []).filter((zone) => zone.groupDef.showAnchor);
  // });
  // _zoneElLoaded = new Subject<boolean>();
  // zoneElLoaded$ = this._zoneElLoaded.asObservable();

  constructor() {
    // effect(() => {
    //   if (this.zoneElements().length > 0) {
    //     this._zoneElLoaded.next(true);
    //   }
    // });
  }

  ngOnInit() {}

  ngAfterViewInit() {}

  ngOnDestroy() {}

  openUrl(link: string) {
    link && window.open(link);
  }
}
