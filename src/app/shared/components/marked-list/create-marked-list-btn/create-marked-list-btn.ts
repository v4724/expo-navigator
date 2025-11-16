import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar } from '@angular/material/snack-bar';
import { finalize } from 'rxjs';
import { MarkedListApiService } from 'src/app/core/services/api/marked-list-api.service';
import { MarkedStallService } from 'src/app/core/services/state/marked-stall-service';
import { UserService } from 'src/app/core/services/state/user-service';

@Component({
  selector: 'app-create-marked-list-btn',
  imports: [CommonModule, MatIconModule],
  templateUrl: './create-marked-list-btn.html',
  styleUrl: './create-marked-list-btn.scss',
})
export class CreateMarkedListBtn {
  private _userService = inject(UserService);
  private _markedListApiService = inject(MarkedListApiService);
  private _markedListService = inject(MarkedStallService);
  private _snackBar = inject(MatSnackBar);

  user = toSignal(this._userService.user$);
  allList = toSignal(this._markedListService.markedList$, { initialValue: [] });

  isCreating = signal(false);

  create() {
    const user = this._userService.user;
    if (!user) {
      return;
    }

    const body = {
      userId: user.id,
      listName: `書籤`,
      icon: '',
      iconColor: '',
      cusIcon: '',
      cusIconColor: '',
      isCusIcon: false,
      isCusIconColor: false,
      list: [],
    };
    this.isCreating.set(true);
    this._markedListApiService
      .create(this.user()?.acc!, body)
      .pipe(
        finalize(() => {
          this.isCreating.set(false);
        }),
      )
      .subscribe((res) => {
        if (res.success) {
          this._snackBar.open('書籤新增成功', '', { duration: 2000 });
          const id = res.data.id;
          this._markedListService.add({ ...body, id });
        } else {
          this._snackBar.open('書籤新增失敗', res.errors[0], { duration: 2000 });
        }
      });
  }
}
