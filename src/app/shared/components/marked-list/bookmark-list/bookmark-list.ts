import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar } from '@angular/material/snack-bar';
import { EditBtn } from 'src/app/components/edit-marked-list/edit-btn/edit-btn';
import { MarkedList } from 'src/app/core/interfaces/marked-stall.interface';
import { MarkedListApiService } from 'src/app/core/services/api/marked-list-api.service';
import { MarkedStallService } from 'src/app/core/services/state/marked-stall-service';
import { UserService } from 'src/app/core/services/state/user-service';
import { AccordionModule } from 'primeng/accordion';
import { SelectStallService } from 'src/app/core/services/state/select-stall-service';
import { StallMapService } from 'src/app/core/services/state/stall-map-service';
import { ButtonModule } from 'primeng/button';
import { ConfirmationService } from 'primeng/api';
import { finalize } from 'rxjs';
import { StallZoneBadge } from '../../stall-info/stall-zone-badge/stall-zone-badge';

@Component({
  selector: 'app-bookmark-list',
  imports: [CommonModule, MatIconModule, EditBtn, AccordionModule, ButtonModule, StallZoneBadge],
  templateUrl: './bookmark-list.html',
  styleUrl: './bookmark-list.scss',
})
export class BookmarkList {
  private _userService = inject(UserService);
  private _markedListService = inject(MarkedStallService);
  private _markedListApiService = inject(MarkedListApiService);
  private _selectStallService = inject(SelectStallService);
  private _stallMapService = inject(StallMapService);
  private _confirmService = inject(ConfirmationService);
  private _snackBar = inject(MatSnackBar);

  user = toSignal(this._userService.user$);
  fetchEnd = toSignal(this._markedListService.fetchEnd$);
  allList = toSignal(this._markedListService.markedList$, { initialValue: [] });

  selectAndFocus(stallId: string) {
    this._selectStallService.selected = stallId;
    setTimeout(() => {
      this._stallMapService.focusStall(stallId);
    }, 100);
  }

  toggleList(list: MarkedList) {
    list.show = !list.show;
    this._markedListService.toggleList(list);
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
              this._snackBar.open('書籤刪除成功', '', { duration: 2000 });
              this._markedListService.delete(list.id);
            } else {
              list.isUpdating = false;
              this._snackBar.open('書籤刪除失敗', res.errors[0], { duration: 2000 });
            }
          });
      },
      reject: () => {},
    });
  }
}
