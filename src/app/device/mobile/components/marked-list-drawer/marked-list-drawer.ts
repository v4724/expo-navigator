import { CommonModule } from '@angular/common';
import { Component, inject, OnInit, signal, ViewChild } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { BookmarkList } from 'src/app/shared/components/marked-list/bookmark-list/bookmark-list';
import { CreateMarkedListBtn } from 'src/app/shared/components/marked-list/create-marked-list-btn/create-marked-list-btn';
import { DrawerOnMobile } from 'src/app/shared/components/drawer-on-mobile/drawer-on-mobile';
import { ToggleSwitch } from 'primeng/toggleswitch';
import { FormsModule } from '@angular/forms';
import { MarkedStallService } from 'src/app/core/services/state/marked-stall-service';
import { UserService } from 'src/app/core/services/state/user-service';
import { ExpoStateService } from 'src/app/core/services/state/expo-state-service';
import { toSignal } from '@angular/core/rxjs-interop';
import { Router, RouterModule } from '@angular/router';
import { UiStateService } from 'src/app/core/services/state/ui-state-service';
import { LeftSidebarService, SidebarType } from 'src/app/core/services/state/left-sidebar-service';
import { map } from 'rxjs';
import { MobileDrawerService } from 'src/app/core/services/state/mobile-drawer-service';

@Component({
  selector: 'app-marked-list-drawer',
  imports: [
    CommonModule,
    ButtonModule,
    CreateMarkedListBtn,
    BookmarkList,
    DrawerOnMobile,
    ToggleSwitch,
    FormsModule,
    RouterModule,
  ],
  templateUrl: './marked-list-drawer.html',
  styleUrl: './marked-list-drawer.scss',
})
export class MarkedListDrawer implements OnInit {
  @ViewChild(DrawerOnMobile) drawer!: DrawerOnMobile;
  @ViewChild(BookmarkList) bookmarkList!: BookmarkList;

  private _router = inject(Router);
  private _markedListService = inject(MarkedStallService);
  private _userService = inject(UserService);
  private _expoStateService = inject(ExpoStateService);
  private _uiStateService = inject(UiStateService);
  private _mobileDrawerService = inject(MobileDrawerService);

  isLogin = toSignal(this._userService.isLogin$);
  bookmarkRoutingSwitch = toSignal(this._expoStateService.bookmarkRoutingSwitch$);
  bookmarkRoutingOnly = toSignal(this._expoStateService.bookmarkRoutingOnly$);

  checked = true;
  isAtRoutingPage = toSignal(this._uiStateService.isAtRoutingPage$);

  constructor() {}

  ngOnInit(): void {
    this._markedListService.layerShown$.subscribe((val) => {
      this.checked = val;
    });

    this._userService.isLogin$.subscribe((val) => {
      if (!val) {
        this.close();
      }
    });
  }

  show() {
    this.drawer.show();
    this.bookmarkList.setAccordionShow(false);
    this._mobileDrawerService.show('bookmarkList', this.drawer);
  }

  onShow() {
    this.bookmarkList.setAccordionShow(true);
    this._mobileDrawerService.show('bookmarkList', this.drawer);
  }

  close() {
    this.drawer?.close();
    this._mobileDrawerService.show('', this.drawer);
  }

  toggleLayer() {
    this._markedListService.toggleLayer();
  }

  gotoRouting() {
    this.close();
    this._router.navigate(['/routing']);
  }
}
