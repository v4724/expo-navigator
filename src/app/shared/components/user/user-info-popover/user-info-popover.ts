import { Component, inject, ViewChild } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { UserService } from 'src/app/core/services/state/user-service';
import { Popover, PopoverModule } from 'primeng/popover';
import { ButtonModule } from 'primeng/button';
import { UserApiService } from 'src/app/core/services/api/user-api.service';
import { StallMapService } from 'src/app/core/services/state/stall-map-service';
import { SelectStallService } from 'src/app/core/services/state/select-stall-service';
import { CreateUserModal } from 'src/app/components/user/create-user-modal/create-user-modal';
import { ConfirmationService, MessageService } from 'primeng/api';
import { DialogService } from 'primeng/dynamicdialog';

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
  private _confirmService = inject(ConfirmationService);
  private _dialogService = inject(DialogService);
  private readonly _messageService = inject(MessageService);

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
                summary: '使用者刪除成功',
              });
              this._userService.logout();
              this.userInfoPopover?.hide();
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
}
