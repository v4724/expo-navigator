import { Component, inject, OnInit, ViewChild } from '@angular/core';
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

  private _userService = inject(UserService);
  private _selectStallService = inject(SelectStallService);

  isLogin = toSignal(this._userService.isLogin$);
  user = toSignal(this._userService.user$);

  acc: string = '';

  ngOnInit(): void {
    this._userService.isLogin$.pipe().subscribe(() => {
      this.userInfoPopover?.hide();
      this.loginPopover?.hide();
    });

    this._userService.user$.pipe().subscribe(() => {
      this.acc = this.user()?.acc ?? '';
    });
  }

  toggle(e: Event) {
    if (this.isLogin()) {
      this.userInfoPopover.toggle(e);
    } else {
      this.loginPopover.toggle(e);
    }
  }

  login() {
    this._userService.login(this.acc);
  }

  logout() {
    this._userService.logout();
  }

  create() {}

  selectStall(stallId: string) {
    this._selectStallService.selected = stallId;
    this.userInfoPopover.hide();
  }
}
