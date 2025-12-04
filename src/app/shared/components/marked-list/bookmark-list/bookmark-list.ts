import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, inject, signal, ViewChild } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { MatIconModule } from '@angular/material/icon';
import { EditBtn } from 'src/app/components/edit-marked-list/edit-btn/edit-btn';
import { MarkedList } from 'src/app/core/interfaces/marked-stall.interface';
import { MarkedListApiService } from 'src/app/core/services/api/marked-list-api.service';
import { MarkedStallService } from 'src/app/core/services/state/marked-stall-service';
import { UserService } from 'src/app/core/services/state/user-service';
import { Accordion, AccordionModule } from 'primeng/accordion';
import { SelectStallService } from 'src/app/core/services/state/select-stall-service';
import { StallMapService } from 'src/app/core/services/state/stall-map-service';
import { ButtonModule } from 'primeng/button';
import { ConfirmationService, MessageService } from 'primeng/api';
import { finalize } from 'rxjs';
import { StallZoneBadge } from '../../stall-info/stall-zone-badge/stall-zone-badge';
import { CheckboxModule } from 'primeng/checkbox';
import { FormsModule } from '@angular/forms';

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
  ],
  templateUrl: './bookmark-list.html',
  styleUrl: './bookmark-list.scss',
})
export class BookmarkList {
  @ViewChild(Accordion) accordion!: Accordion;

  private _userService = inject(UserService);
  private _markedListService = inject(MarkedStallService);
  private _markedListApiService = inject(MarkedListApiService);
  private _selectStallService = inject(SelectStallService);
  private _stallMapService = inject(StallMapService);
  private _confirmService = inject(ConfirmationService);
  private readonly _messageService = inject(MessageService);

  user = toSignal(this._userService.user$);
  fetchEnd = toSignal(this._markedListService.fetchEnd$);
  allList = toSignal(this._markedListService.markedList$, { initialValue: [] });

  accordionShow = signal<boolean>(true);

  selectAndFocus(stallId: string) {
    this._selectStallService.selected = stallId;
    setTimeout(() => {
      this._stallMapService.focusStall(stallId);
    }, 100);
  }

  toggleList(bookmark: MarkedList) {
    this._markedListService.toggleList(bookmark);
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
        list.isUpdating = true;
        this._markedListApiService
          .delete(list.id, this.user()?.acc!)
          .pipe(
            finalize(() => {
              list.isUpdating = false;
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
              list.isUpdating = false;
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
}
