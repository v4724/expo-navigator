import { Component, inject, OnInit } from '@angular/core';
import { Button } from 'primeng/button';
import { LeftSidebarService, SidebarType } from 'src/app/core/services/state/left-sidebar-service';
import { toSignal } from '@angular/core/rxjs-interop';
import { map } from 'rxjs';
import { CommonModule } from '@angular/common';
import { MatIcon } from '@angular/material/icon';
import { TooltipModule } from 'primeng/tooltip';
import { BookmarkList } from '../bookmark-list/bookmark-list';
import { CreateMarkedListBtn } from '../create-marked-list-btn/create-marked-list-btn';
import { MarkedStallService } from 'src/app/core/services/state/marked-stall-service';
import { ToggleSwitch } from 'primeng/toggleswitch';
import { FormsModule } from '@angular/forms';

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

  showControls = toSignal(
    this._leftSidebarService.show$.pipe(
      map((layer: SidebarType) => {
        return layer === 'bookmarkList';
      }),
    ),
  );

  checked = false;

  ngOnInit(): void {
    this._markedListService.layerShown$.subscribe((val) => {
      this.checked = val;
    });
  }

  toggleLayer() {
    this._markedListService.toggleLayer();
  }

  close() {
    this._leftSidebarService.toggle('');
  }
}
