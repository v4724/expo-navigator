import { CommonModule } from '@angular/common';
import { Component, ViewChild } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { BookmarkList } from 'src/app/shared/components/marked-list/bookmark-list/bookmark-list';
import { CreateMarkedListBtn } from 'src/app/shared/components/marked-list/create-marked-list-btn/create-marked-list-btn';
import { DrawerOnMobile } from 'src/app/shared/components/drawer-on-mobile/drawer-on-mobile';

@Component({
  selector: 'app-marked-list-drawer',
  imports: [CommonModule, ButtonModule, CreateMarkedListBtn, BookmarkList, DrawerOnMobile],
  templateUrl: './marked-list-drawer.html',
  styleUrl: './marked-list-drawer.scss',
})
export class MarkedListDrawer {
  @ViewChild(DrawerOnMobile) drawer!: DrawerOnMobile;

  show() {
    this.drawer.show();
  }

  close() {
    this.drawer.close();
  }
}
