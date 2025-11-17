import { CommonModule } from '@angular/common';
import { Component, inject, ViewChild } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import {
  AnimationController,
  IonModal,
  IonContent,
  IonButton,
  IonIcon,
  IonFooter,
  IonToolbar,
  IonButtons,
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { close } from 'ionicons/icons';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { CreateUserModal } from 'src/app/components/user/create-user-modal/create-user-modal';
import { UserApiService } from 'src/app/core/services/api/user-api.service';
import { SelectStallService } from 'src/app/core/services/state/select-stall-service';
import { StallMapService } from 'src/app/core/services/state/stall-map-service';
import { UserService } from 'src/app/core/services/state/user-service';
import { ConfirmDialog } from 'src/app/shared/components/confirm-dialog/confirm-dialog';

@Component({
  selector: 'app-user-modal',
  imports: [
    CommonModule,
    FormsModule,
    InputTextModule,
    ButtonModule,
    IonModal,
    IonContent,
    IonButton,
    IonIcon,
    IonFooter,
    IonToolbar,
    IonButtons,
  ],
  templateUrl: './user-modal.html',
  styleUrl: './user-modal.scss',
})
export class UserModal {
  @ViewChild(IonModal) modal!: IonModal;

  private animationCtrl = inject(AnimationController);

  private _userService = inject(UserService);
  private _userApiService = inject(UserApiService);
  private _selectStallService = inject(SelectStallService);
  private _stallMapService = inject(StallMapService);
  private _snackBar = inject(MatSnackBar);
  private _dialog = inject(MatDialog);

  isLogin = toSignal(this._userService.isLogin$);
  user = toSignal(this._userService.user$);

  acc: string = '';

  constructor() {
    addIcons({ close });
  }

  enterAnimation = (baseEl: HTMLElement) => {
    const root = baseEl.shadowRoot;

    const backdropAnimation = this.animationCtrl
      .create()
      .addElement(root!.querySelector('ion-backdrop')!)
      .fromTo('opacity', '0.01', 'var(--backdrop-opacity)');

    const wrapperAnimation = this.animationCtrl
      .create()
      .addElement(root!.querySelector('.modal-wrapper')!)
      .keyframes([
        { offset: 0, opacity: '1', transform: 'translateX(100%)' },
        { offset: 1, opacity: '1', transform: 'translateX(0)' },
      ]);

    return this.animationCtrl
      .create()
      .addElement(baseEl)
      .easing('ease-out')
      .duration(300)
      .addAnimation([backdropAnimation, wrapperAnimation]);
  };

  leaveAnimation = (baseEl: HTMLElement) => {
    return this.enterAnimation(baseEl).direction('reverse');
  };

  selectAndFocus(stallId: string) {
    this._selectStallService.selected = stallId;
    this.modal.dismiss();
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
            this.modal.dismiss();
          }
        }
      });
  }

  logout() {
    this._userService.logout();
    this.modal.dismiss();
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
              this.modal.dismiss();
            } else {
              this._snackBar.open('使用者刪除失敗', res.errors[0], { duration: 2000 });
            }
          });
      }
    });
  }
}
