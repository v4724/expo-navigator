import { Component, computed, ElementRef, inject, signal, ViewChild } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ExpoStateService } from 'src/app/core/services/state/expo-state-service';
import { CreateMarkedListBtn } from 'src/app/shared/components/marked-list/create-marked-list-btn/create-marked-list-btn';
import { BookmarkList } from 'src/app/shared/components/marked-list/bookmark-list/bookmark-list';
import { TooltipModule } from 'primeng/tooltip';
import { ButtonModule } from 'primeng/button';
import { RouterModule } from '@angular/router';
import { User } from 'src/app/components/user/user';
import { Footer } from 'src/app/layout/footer/footer';
import { UserService } from 'src/app/core/services/state/user-service';
import { RoutingMap } from './routing-map/routing-map';
import { filter, switchMap } from 'rxjs';

@Component({
  selector: 'app-routing',
  imports: [
    CreateMarkedListBtn,
    BookmarkList,
    ButtonModule,
    TooltipModule,
    RouterModule,
    User,
    Footer,
    RoutingMap,
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
  bookmarkRoutingOnly = toSignal(
    this._expoStateService.fetchEnd$.pipe(
      filter((val) => val),
      switchMap(() => this._expoStateService.bookmarkRoutingOnly$),
    ),
    { initialValue: true },
  );

  onDragging = false;
}
