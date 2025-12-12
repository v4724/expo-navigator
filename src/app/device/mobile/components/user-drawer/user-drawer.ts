import { CommonModule } from '@angular/common';
import { Component, inject, signal, ViewChild } from '@angular/core';
import { SelectStallService } from 'src/app/core/services/state/select-stall-service';
import { StallMapService } from 'src/app/core/services/state/stall-map-service';
import { StallData } from 'src/app/core/interfaces/stall.interface';
import { UserService } from 'src/app/core/services/state/user-service';
import { toSignal } from '@angular/core/rxjs-interop';
import { Drawer, DrawerModule } from 'primeng/drawer';
import { CreateUserModal } from 'src/app/components/user/create-user-modal/create-user-modal';
import { UserApiService } from 'src/app/core/services/api/user-api.service';
import { Avatar } from 'primeng/avatar';
import { FormsModule } from '@angular/forms';
import { InputTextModule } from 'primeng/inputtext';
import { DialogService } from 'primeng/dynamicdialog';
import { ConfirmationService, MessageService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { ExpoStateService } from 'src/app/core/services/state/expo-state-service';
import packageJson from '../../../../../../package.json';

@Component({
  selector: 'app-user-drawer',
  imports: [CommonModule, Avatar, FormsModule, InputTextModule, DrawerModule, ButtonModule],
  templateUrl: './user-drawer.html',
  styleUrl: './user-drawer.scss',
})
export class UserDrawer {
  @ViewChild(Drawer) drawer!: Drawer;

  private _selectStallService = inject(SelectStallService);
  private _stallMapService = inject(StallMapService);
  private _userService = inject(UserService);
  private _userApiService = inject(UserApiService);
  private readonly _messageService = inject(MessageService);
  private _dialogService = inject(DialogService);
  private _confirmService = inject(ConfirmationService);
  private _expoStateService = inject(ExpoStateService);

  stall = signal<StallData | undefined>(undefined);
  isLogin = toSignal(this._userService.isLogin$);
  user = toSignal(this._userService.user$);
  reportUrl = toSignal(this._expoStateService.reportUrl$);

  acc: string = '';
  visible = false;
  appVersion = packageJson.version;

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
            this._messageService.add({
              severity: 'custom',
              summary: `使用者不存在`,
              data: {
                type: 'warning',
              },
            });
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
    this._dialogService.open(CreateUserModal, {
      header: '新增使用者',
      dismissableMask: true, // 取消點選背景自動關閉
      modal: true,
      width: '400px',
      height: '400px',
    });
  }

  edit() {
    this._dialogService.open(CreateUserModal, {
      header: '編輯使用者',
      dismissableMask: true, // 取消點選背景自動關閉
      modal: true,
      width: '400px',
      height: '400px',
      inputValues: {
        isEdit: true,
      },
    });
  }

  delete() {
    this._confirmService.confirm({
      message: '確認刪除該使用者？',
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
        this._userApiService
          .delete(this.user()?.id!, this.user()?.acc!)
          .pipe()
          .subscribe((res) => {
            if (res.success) {
              this._messageService.add({
                severity: 'custom',
                summary: '刪除成功',
              });
              this._userService.logout();
              this.close();
            } else {
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

  openUrl() {
    window.open(this.reportUrl(), '_blank');
  }
}
