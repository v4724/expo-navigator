import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, inject, OnInit, signal, ViewChild } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { MatIconModule } from '@angular/material/icon';
import { EditBtn } from 'src/app/components/edit-marked-list/edit-btn/edit-btn';
import { MarkedList } from 'src/app/core/interfaces/marked-stall.interface';
import { MarkedListApiService } from 'src/app/core/services/api/marked-list-api.service';
import { MarkedStallService } from 'src/app/core/services/state/marked-stall-service';
import { UserService } from 'src/app/core/services/state/user-service';
import {
  Accordion,
  AccordionModule,
  AccordionTabCloseEvent,
  AccordionTabOpenEvent,
} from 'primeng/accordion';
import { SelectStallService } from 'src/app/core/services/state/select-stall-service';
import { StallMapService } from 'src/app/core/services/state/stall-map-service';
import { ButtonModule } from 'primeng/button';
import { ConfirmationService, MessageService } from 'primeng/api';
import { finalize } from 'rxjs';
import { StallZoneBadge } from '../../stall-info/stall-zone-badge/stall-zone-badge';
import { CheckboxModule } from 'primeng/checkbox';
import { FormsModule } from '@angular/forms';
import { RoutingStallService } from 'src/app/core/services/state/routing-stall-service';
import { ExpoStateService } from 'src/app/core/services/state/expo-state-service';
import { Router } from '@angular/router';
import {
  CdkDropList,
  CdkDrag,
  CdkDragDrop,
  moveItemInArray,
  DragDropModule,
} from '@angular/cdk/drag-drop';
import { StallData } from 'src/app/core/interfaces/stall.interface';
import { Tooltip } from 'primeng/tooltip';
import { BadgeModule } from 'primeng/badge';

@Component({
  selector: 'app-bookmark-list',
  imports: [
    CommonModule,
    MatIconModule,
    EditBtn,
    AccordionModule,
    ButtonModule,
    StallZoneBadge,
    CheckboxModule,
    FormsModule,
    CdkDropList,
    CdkDrag,
    DragDropModule,
    Tooltip,
    BadgeModule,
  ],
  templateUrl: './bookmark-list.html',
  styleUrl: './bookmark-list.scss',
})
export class BookmarkList implements OnInit {
  @ViewChild(Accordion) accordion!: Accordion;

  private _router = inject(Router);
  private _userService = inject(UserService);
  private _markedListService = inject(MarkedStallService);
  private _markedListApiService = inject(MarkedListApiService);
  private _selectStallService = inject(SelectStallService);
  private _stallMapService = inject(StallMapService);
  private _confirmService = inject(ConfirmationService);
  private _routingStallService = inject(RoutingStallService);
  private _expoStateService = inject(ExpoStateService);
  private cdr = inject(ChangeDetectorRef);

  private readonly _messageService = inject(MessageService);

  user = toSignal(this._userService.user$);
  fetchEnd = toSignal(this._markedListService.fetchEnd$);
  allList = toSignal(this._markedListService.markedList$, { initialValue: [] });
  bookmarkRoutingSwitch = toSignal(this._expoStateService.bookmarkRoutingSwitch$, {
    initialValue: false,
  });

  atRoutingPage = signal<boolean>(false);
  accordionShow = signal<boolean>(true);

  ngOnInit() {
    const currentUrl = this._router.url;
    this.atRoutingPage.set(currentUrl.includes('routing'));
  }

  selectAndFocus(stallId: string) {
    this._selectStallService.selected = stallId;
    setTimeout(() => {
      this._stallMapService.focusStall(stallId);
    }, 100);
  }

  toggleList(bookmark: MarkedList) {
    this._markedListService.toggleListShown(bookmark);
  }

  deleteList(e: Event, list: MarkedList) {
    e.stopPropagation();
    this._confirmService.confirm({
      message: `是否刪除「${list.listName}」？`,
      header: '確認',
      closable: false,
      icon: 'pi pi-exclamation-triangle',
      rejectButtonProps: {
        label: '取消',
        severity: 'secondary',
        outlined: true,
        text: true,
      },
      acceptButtonProps: {
        label: '刪除',
        text: true,
      },
      accept: () => {
        list.isDeleting = true;
        this._markedListApiService
          .delete(list.id, this.user()?.acc!)
          .pipe(
            finalize(() => {
              list.isDeleting = false;
            }),
          )
          .subscribe((res) => {
            if (res.success) {
              this._messageService.add({
                severity: 'custom',
                summary: '刪除成功',
              });
              this._markedListService.delete(list.id);
            } else {
              list.isDeleting = false;
              this._messageService.add({
                severity: 'custom',
                summary: `刪除失敗 ${res.errors[0]}`,
                sticky: true,
                closable: true,
                data: {
                  type: 'warning',
                },
              });
            }
          });
      },
      reject: () => {},
    });
  }

  // 為了 drawer 開/關 後寬度問題，重畫元件
  setAccordionShow(val: boolean) {
    this.accordionShow.set(val);
  }

  onTabOpen(e: AccordionTabOpenEvent) {
    this._markedListService.focusList = this.allList()[e.index];
  }

  onTabClose(e: AccordionTabCloseEvent) {
    this._markedListService.focusList = undefined;
  }

  togglePath(item: MarkedList, e: Event) {
    e.stopPropagation();

    item.showPath = !item.showPath;
    this._routingStallService.togglePath(item);
  }

  autoRouting(item: MarkedList, e: Event) {
    e?.stopPropagation();

    this._routingStallService.autoRouting(item);
  }

  // 手動變更順序
  drop(event: CdkDragDrop<StallData[]>, bookmark: MarkedList) {
    const cat = Array.from(bookmark.list);
    moveItemInArray(cat, event.previousIndex, event.currentIndex);

    this._routingStallService.updateOrderByManual(bookmark, cat);
  }

  isUnstored(bookmark: MarkedList) {
    const origOrder = this._routingStallService.unstoredCache(bookmark.id);
    return !!origOrder;
  }

  saveUnstore(e: Event, bookmark: MarkedList) {
    e.stopPropagation();

    if (bookmark.isUpdating) {
      return;
    }

    const dto = this._markedListApiService.transformToDto(bookmark);

    bookmark.isUpdating = true;
    this._markedListApiService
      .update(bookmark.id, this.user()?.acc!, dto)
      .pipe(
        finalize(() => {
          bookmark.isUpdating = false;
        }),
      )
      .subscribe((res) => {
        if (res.success) {
          this._markedListService.update(dto);
          requestAnimationFrame(() => {
            this.cdr.detectChanges();
          });
        }
      });
  }
}
