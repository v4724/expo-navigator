import { CommonModule } from '@angular/common';
import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { MatIconModule } from '@angular/material/icon';
import { MarkedStallService } from 'src/app/core/services/state/marked-stall-service';
import { CdkDrag, CdkDragDrop, CdkDropList, moveItemInArray } from '@angular/cdk/drag-drop';
import { MarkedList } from 'src/app/core/interfaces/marked-stall.interface';
import { SelectStallService } from 'src/app/core/services/state/select-stall-service';
import { MarkedListApiService } from 'src/app/core/services/api/marked-list-api.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { EditBtn } from '../../edit-marked-list/edit-btn/edit-btn';
import { UserService } from 'src/app/core/services/state/user-service';
import { finalize } from 'rxjs';

@Component({
  selector: 'app-marked-layer',
  imports: [CommonModule, MatIconModule, EditBtn],
  templateUrl: './marked-layer.html',
  styleUrl: './marked-layer.scss',
})
export class MarkedLayer implements OnInit {
  isSectionOpen = signal(false);
  isCreating = signal(false);

  // Helpers
  private _markedListService = inject(MarkedStallService);
  private _markedListApiService = inject(MarkedListApiService);
  private _selectStallService = inject(SelectStallService);
  private _userService = inject(UserService);
  private _snackBar = inject(MatSnackBar);

  show = toSignal(this._markedListService.layerShown$);
  user = toSignal(this._userService.user$);

  // data
  fetchEnd = toSignal(this._markedListService.fetchEnd$);
  allList = toSignal(this._markedListService.markedList$, { initialValue: [] });

  ngOnInit(): void {}

  toggleSection() {
    this.isSectionOpen.update((v) => !v);
  }

  toggleLayer() {
    this._markedListService.toggleLayer();
  }

  toggleList(list: MarkedList) {
    list.show = !list.show;
    this._markedListService.toggleList(list);
  }

  create() {
    const user = this._userService.user;
    if (!user) {
      return;
    }

    const body = {
      userId: user.id,
      listName: `書籤${this.allList().length + 1}`,
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

  deleteList(list: MarkedList) {
    list.isUpdating = true;
    this._markedListApiService.delete(list.id, this.user()?.acc!).subscribe((res) => {
      if (res.success) {
        this._snackBar.open('書籤刪除成功', '', { duration: 2000 });
        this._markedListService.delete(list.id);
      } else {
        list.isUpdating = false;
        this._snackBar.open('書籤刪除失敗', res.errors[0], { duration: 2000 });
      }
    });
  }

  drop(event: CdkDragDrop<MarkedList[]>) {
    const newArr = [...this.allList()];
    moveItemInArray(newArr, event.previousIndex, event.currentIndex);
    this._markedListService.allList = newArr;
  }

  selectStall(stallId: string) {
    this._selectStallService.selected = stallId;
  }
}
