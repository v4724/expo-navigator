import { Component, inject, ViewChild } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { UserService } from 'src/app/core/services/state/user-service';
import { Popover, PopoverModule } from 'primeng/popover';
import { ButtonModule } from 'primeng/button';
import { UserApiService } from 'src/app/core/services/api/user-api.service';
import { StallMapService } from 'src/app/core/services/state/stall-map-service';
import { SelectStallService } from 'src/app/core/services/state/select-stall-service';
import { MatDialog } from '@angular/material/dialog';
import { CreateUserModal } from 'src/app/components/user/create-user-modal/create-user-modal';
import { ConfirmDialog } from '../../confirm-dialog/confirm-dialog';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-user-info-popover',
  imports: [PopoverModule, ButtonModule],
  templateUrl: './user-info-popover.html',
  styleUrl: './user-info-popover.scss',
})
export class UserInfoPopover {
  @ViewChild('userInfoPopover') userInfoPopover!: Popover;

  private _userService = inject(UserService);
  private _selectStallService = inject(SelectStallService);
  private _stallMapService = inject(StallMapService);
  private _userApiService = inject(UserApiService);
  private _dialog = inject(MatDialog);
  private _snackBar = inject(MatSnackBar);

  user = toSignal(this._userService.user$);

  toggle(e: Event) {
    this.userInfoPopover?.toggle(e);
  }

  hide() {
    this.userInfoPopover?.hide();
  }

  selectAndFocus(stallId: string) {
    this._selectStallService.selected = stallId;
    this.userInfoPopover?.hide();
    setTimeout(() => {
      this._stallMapService.focusStall(stallId);
    }, 100);
  }

  edit() {
    this.userInfoPopover?.hide();
    this._dialog.open(CreateUserModal, {
      hasBackdrop: true, // 有底色
      disableClose: true, // 取消點選背景自動關閉
      width: '60vw',
      maxWidth: '400px',
      minHeight: '200px',
      maxHeight: '90vh',
      panelClass: [''],
      data: { isEdit: true },
    });
  }

  delete() {
    const dialogRef = this._dialog.open(ConfirmDialog, {
      disableClose: true, // 取消點選背景自動關閉
      data: {
        label: '確認刪除該使用者？',
      },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result === 'CONFIRM') {
        console.debug('結束編輯');
        this._userApiService
          .delete(this.user()?.id!, this.user()?.acc!)
          .pipe()
          .subscribe((res) => {
            if (res.success) {
              this._snackBar.open('使用者刪除成功', '', { duration: 2000 });
              this._userService.logout();
              this.userInfoPopover?.hide();
            } else {
              this._snackBar.open('使用者刪除失敗', res.errors[0], { duration: 2000 });
            }
          });
      }
    });
  }
}
