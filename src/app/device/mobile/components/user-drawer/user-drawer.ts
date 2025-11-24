import { CommonModule } from '@angular/common';
import { Component, inject, signal, ViewChild } from '@angular/core';
import { Button } from 'primeng/button';
import { SelectStallService } from 'src/app/core/services/state/select-stall-service';
import { StallMapService } from 'src/app/core/services/state/stall-map-service';
import { StallData } from 'src/app/core/interfaces/stall.interface';
import { UserService } from 'src/app/core/services/state/user-service';
import { toSignal } from '@angular/core/rxjs-interop';
import { Drawer, DrawerModule } from 'primeng/drawer';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { CreateUserModal } from 'src/app/components/user/create-user-modal/create-user-modal';
import { ConfirmDialog } from 'src/app/shared/components/confirm-dialog/confirm-dialog';
import { UserApiService } from 'src/app/core/services/api/user-api.service';
import { Avatar } from 'primeng/avatar';
import { FormsModule } from '@angular/forms';
import { InputTextModule } from 'primeng/inputtext';

@Component({
  selector: 'app-user-drawer',
  imports: [CommonModule, Avatar, FormsModule, InputTextModule, DrawerModule],
  templateUrl: './user-drawer.html',
  styleUrl: './user-drawer.scss',
})
export class UserDrawer {
  @ViewChild(Drawer) drawer!: Drawer;

  private _selectStallService = inject(SelectStallService);
  private _stallMapService = inject(StallMapService);
  private _userService = inject(UserService);
  private _userApiService = inject(UserApiService);
  private _snackBar = inject(MatSnackBar);
  private _dialog = inject(MatDialog);

  stall = signal<StallData | undefined>(undefined);
  isLogin = toSignal(this._userService.isLogin$);
  user = toSignal(this._userService.user$);

  acc: string = '';
  visible = false;

  ngOnInit(): void {}

  show() {
    this.visible = true;
  }

  close() {
    this.visible = false;
  }

  selectAndFocus(stallId: string) {
    this._selectStallService.selected = stallId;
    this.close();
    setTimeout(() => {
      this._stallMapService.focusStall(stallId);
    }, 100);
  }

  login() {
    this._userService
      .login(this.acc)
      .pipe()
      .subscribe((res) => {
        if (res?.success) {
          if (res.data === null) {
            this._snackBar.open('使用者不存在', '', { duration: 2000 });
          } else {
            this.acc = '';
            this.close();
          }
        }
      });
  }

  logout() {
    this._userService.logout();
    this.close();
  }

  create() {
    this._dialog.open(CreateUserModal, {
      hasBackdrop: true, // 有底色
      disableClose: true, // 取消點選背景自動關閉
      width: '60vw',
      maxWidth: '400px',
      minHeight: '200px',
      maxHeight: '90vh',
      panelClass: [''],
    });
  }

  edit() {
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
              this.close();
            } else {
              this._snackBar.open('使用者刪除失敗', res.errors[0], { duration: 2000 });
            }
          });
      }
    });
  }
}
