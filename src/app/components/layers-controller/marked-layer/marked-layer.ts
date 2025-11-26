import { CommonModule } from '@angular/common';
import { Component, inject, OnInit, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { MatIconModule } from '@angular/material/icon';
import { MarkedStallService } from 'src/app/core/services/state/marked-stall-service';
import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { MarkedList } from 'src/app/core/interfaces/marked-stall.interface';
import { SelectStallService } from 'src/app/core/services/state/select-stall-service';
import { UserService } from 'src/app/core/services/state/user-service';
import { CreateMarkedListBtn } from 'src/app/shared/components/marked-list/create-marked-list-btn/create-marked-list-btn';
import { BookmarkList } from 'src/app/shared/components/marked-list/bookmark-list/bookmark-list';
import { PanelModule } from 'primeng/panel';

@Component({
  selector: 'app-marked-layer',
  imports: [CommonModule, MatIconModule, PanelModule, CreateMarkedListBtn, BookmarkList],
  templateUrl: './marked-layer.html',
  styleUrl: './marked-layer.scss',
})
export class MarkedLayer implements OnInit {
  isSectionOpen = signal(false);

  // Helpers
  private _markedListService = inject(MarkedStallService);
  private _selectStallService = inject(SelectStallService);
  private _userService = inject(UserService);

  show = toSignal(this._markedListService.layerShown$);
  user = toSignal(this._userService.user$);

  // data
  allList = toSignal(this._markedListService.markedList$, { initialValue: [] });

  ngOnInit(): void {}

  toggleSection() {
    this.isSectionOpen.update((v) => !v);
  }

  toggleLayer() {
    this._markedListService.toggleLayer();
  }

  drop(event: CdkDragDrop<MarkedList[]>) {
    const newArr = [...this.allList()];
    moveItemInArray(newArr, event.previousIndex, event.currentIndex);
    this._markedListService.allList = newArr;
  }

  selectStall(stallId: string) {
    this._selectStallService.selected = stallId;
  }
}
