import { CommonModule } from '@angular/common';
import { Component, inject, OnInit, ViewChild } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { BookmarkList } from 'src/app/shared/components/marked-list/bookmark-list/bookmark-list';
import { CreateMarkedListBtn } from 'src/app/shared/components/marked-list/create-marked-list-btn/create-marked-list-btn';
import { DrawerOnMobile } from 'src/app/shared/components/drawer-on-mobile/drawer-on-mobile';
import { ToggleSwitch } from 'primeng/toggleswitch';
import { FormsModule } from '@angular/forms';
import { MarkedStallService } from 'src/app/core/services/state/marked-stall-service';

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
  ],
  templateUrl: './marked-list-drawer.html',
  styleUrl: './marked-list-drawer.scss',
})
export class MarkedListDrawer implements OnInit {
  @ViewChild(DrawerOnMobile) drawer!: DrawerOnMobile;
  @ViewChild(BookmarkList) bookmarkList!: BookmarkList;

  private _markedListService = inject(MarkedStallService);

  checked = false;

  ngOnInit(): void {
    this._markedListService.layerShown$.subscribe((val) => {
      this.checked = val;
    });
  }

  show() {
    this.drawer.show();
    this.bookmarkList.setAccordionShow(false);
  }

  onShow() {
    this.bookmarkList.setAccordionShow(true);
  }

  close() {
    this.drawer.close();
  }

  toggleLayer() {
    this._markedListService.toggleLayer();
  }
}
