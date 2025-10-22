import { Component, ElementRef, inject, OnInit, ViewChild } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { MatIcon } from '@angular/material/icon';
import { Popover, PopoverModule } from 'primeng/popover';
import { UserService } from 'src/app/core/services/state/user-service';
import { CheckboxModule } from 'primeng/checkbox';
import { CommonModule } from '@angular/common';
import { InputTextModule } from 'primeng/inputtext';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { SelectStallService } from 'src/app/core/services/state/select-stall-service';
import { CreateUserModal } from './create-user-modal/create-user-modal';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { UserApiService } from 'src/app/core/services/api/user-api.service';
import { ConfirmDialog } from 'src/app/shared/components/confirm-dialog/confirm-dialog';

@Component({
  selector: 'app-user',
  imports: [
    CommonModule,
    FormsModule,
    InputTextModule,
    MatIcon,
    PopoverModule,
    CheckboxModule,
    ButtonModule,
  ],
  templateUrl: './user.html',
  styleUrl: './user.scss',
})
export class User implements OnInit {
  @ViewChild('userInfoPopover') userInfoPopover!: Popover;
  @ViewChild('loginPopover') loginPopover!: Popover;
  @ViewChild('loginInput') loginInput!: ElementRef<HTMLInputElement>;

  private _userApiService = inject(UserApiService);
  private _userService = inject(UserService);
  private _selectStallService = inject(SelectStallService);
  private _dialog = inject(MatDialog);
  private _snackBar = inject(MatSnackBar);

  isLogin = toSignal(this._userService.isLogin$);
  user = toSignal(this._userService.user$);

  acc: string = '';

  ngOnInit(): void {
    this._userService.isLogin$.pipe().subscribe(() => {
      this.userInfoPopover?.hide();
      this.loginPopover?.hide();
    });
  }

  toggle(e: Event) {
    if (this.isLogin()) {
      this.userInfoPopover?.toggle(e);
    } else {
      this.loginPopover?.toggle(e);
      // 等待 popover DOM 完成顯示後再 focus
      setTimeout(() => {
        this.loginInput?.nativeElement?.focus();
      }, 50);
    }
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
            this.userInfoPopover?.hide();
          }
        }
      });
  }

  logout() {
    this._userService.logout();
    this.userInfoPopover?.hide();
  }

  create() {
    this.loginPopover?.hide();
    this._dialog.open(CreateUserModal, {
      hasBackdrop: true, // 有底色
      disableClose: true, // 取消點選背景自動關閉
      width: '60vw',
      maxWidth: '400px',
      maxHeight: '400px',
      panelClass: [''],
    });
  }

  edit() {
    this.userInfoPopover?.hide();
    this._dialog.open(CreateUserModal, {
      hasBackdrop: true, // 有底色
      disableClose: true, // 取消點選背景自動關閉
      width: '60vw',
      maxWidth: '400px',
      maxHeight: '400px',
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
          .delete(this.user()?.id!)
          .pipe()
          .subscribe((res) => {
            if (res.success) {
              this._snackBar.open('使用者刪除成功', '', { duration: 2000 });
              this._userService.logout();
              this.userInfoPopover?.hide();
              // TODO: 刪除該使用者相關資訊(marked stalls)
            } else {
              this._snackBar.open('使用者刪除失敗', res.errors[0], { duration: 2000 });
            }
          });
      }
    });
  }

  selectStall(stallId: string) {
    this._selectStallService.selected = stallId;
    this.userInfoPopover?.hide();
  }
}
