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
import { CreateUserModal } from './create-user-modal/create-user-modal';
import { UserInfoPopover } from 'src/app/shared/components/user/user-info-popover/user-info-popover';
import { DialogService } from 'primeng/dynamicdialog';
import { MessageService } from 'primeng/api';

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
    UserInfoPopover,
  ],
  templateUrl: './user.html',
  styleUrl: './user.scss',
})
export class User implements OnInit {
  @ViewChild('userInfoPopover') userInfoPopover!: UserInfoPopover;
  @ViewChild('loginPopover') loginPopover!: Popover;
  @ViewChild('loginInput') loginInput!: ElementRef<HTMLInputElement>;

  private _userService = inject(UserService);
  private _dialogService = inject(DialogService);
  private readonly _messageService = inject(MessageService);

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
    if (this.acc.length === 0) {
      return;
    }

    this._userService
      .login(this.acc)
      .pipe()
      .subscribe((res) => {
        if (res?.success) {
          if (res.data === null) {
            this._messageService.add({
              severity: 'custom',
              summary: '使用者不存在',
              data: {
                type: 'warning',
              },
            });
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
    this._dialogService.open(CreateUserModal, {
      header: '新增使用者',
      dismissableMask: true, // 取消點選背景自動關閉
      modal: true,
      width: '400px',
      height: '400px',
    });
  }
}
