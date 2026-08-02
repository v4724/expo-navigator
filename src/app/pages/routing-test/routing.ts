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
import { User } from 'src/app/components/user/user';
import { Footer } from 'src/app/layout/footer/footer';
import { UserService } from 'src/app/core/services/state/user-service';

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
    User,
    Footer,
  ],
  templateUrl: './routing.html',
  styleUrl: './routing.scss',
})
export class Routing {
  @ViewChild('mapContent') mapContent!: ElementRef<HTMLDivElement>;
  private _expoStateService = inject(ExpoStateService);
  private _userService = inject(UserService);

  isLogin = toSignal(this._userService.isLogin$);
  expoTitle = toSignal(this._expoStateService.expoTitle$);
  mapImgSrc = toSignal(this._expoStateService.mapImageUrl$);
  bookmarkRoutingOnly = toSignal(this._expoStateService.bookmarkRoutingOnly$);

  onDragging = false;
}
