import { Component, inject, OnInit } from '@angular/core';
import { Button } from 'primeng/button';
import { LeftSidebarService, SidebarType } from 'src/app/core/services/state/left-sidebar-service';
import { toSignal } from '@angular/core/rxjs-interop';
import { map } from 'rxjs';
import { CommonModule } from '@angular/common';
import { TooltipModule } from 'primeng/tooltip';
import { BookmarkList } from '../bookmark-list/bookmark-list';
import { CreateMarkedListBtn } from '../create-marked-list-btn/create-marked-list-btn';
import { MarkedStallService } from 'src/app/core/services/state/marked-stall-service';
import { ToggleSwitch } from 'primeng/toggleswitch';
import { FormsModule } from '@angular/forms';
import { UserService } from 'src/app/core/services/state/user-service';

@Component({
  selector: 'app-marked-list-drawer',
  imports: [
    CommonModule,
    BookmarkList,
    Button,
    TooltipModule,
    CreateMarkedListBtn,
    FormsModule,
    ToggleSwitch,
  ],
  templateUrl: './marked-list-drawer.html',
  styleUrl: './marked-list-drawer.scss',
})
export class MarkedListDrawer implements OnInit {
  private readonly _leftSidebarService = inject(LeftSidebarService);
  private _markedListService = inject(MarkedStallService);
  private _userService = inject(UserService);

  showControls = toSignal(
    this._leftSidebarService.show$.pipe(
      map((layer: SidebarType) => {
        return layer === 'bookmarkList';
      }),
    ),
  );
  isLogin = toSignal(this._userService.isLogin$);

  checked = false;

  ngOnInit(): void {
    this._markedListService.layerShown$.subscribe((val) => {
      this.checked = val;
    });

    this._userService.isLogin$.subscribe((val) => {
      if (!val && this._leftSidebarService.curr === 'bookmarkList') {
        this._leftSidebarService.toggle('');
      }
    });
  }

  toggleLayer() {
    this._markedListService.toggleLayer();
  }

  close() {
    this._leftSidebarService.toggle('');
  }
}
