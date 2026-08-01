import { CommonModule } from '@angular/common';
import { Component, inject, input, OnInit, output, ViewChild } from '@angular/core';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { MatIcon } from '@angular/material/icon';
import { Popover, PopoverModule } from 'primeng/popover';
import { finalize } from 'rxjs';
import { MarkedList } from 'src/app/core/interfaces/marked-stall.interface';
import { StallData } from 'src/app/core/interfaces/stall.interface';
import { MarkedListApiService } from 'src/app/core/services/api/marked-list-api.service';
import { MarkedStallService } from 'src/app/core/services/state/marked-stall-service';
import { UserService } from 'src/app/core/services/state/user-service';

@Component({
  selector: 'app-stall-bookmark-popover',
  imports: [CommonModule, MatIcon, PopoverModule],
  templateUrl: './stall-bookmark-popover.html',
  styleUrl: './stall-bookmark-popover.scss',
})
export class StallBookmarkPopover implements OnInit {
  @ViewChild('markedListPopover') op!: Popover;

  dismissable = input<boolean>(true);
  stall = input.required<StallData | undefined>();
  stall$ = toObservable(this.stall);

  afterUpdate = output<boolean>();

  private _markedListApiService = inject(MarkedListApiService);
  private _markedListService = inject(MarkedStallService);
  private _userService = inject(UserService);

  user = toSignal(this._userService.user$);

  allMarkedList = toSignal(this._markedListService.markedList$);
  markedMapByStallId = toSignal(this._markedListService.markedMapByStallId$);

  ngOnInit() {}

  removeFromMarkedList(data: MarkedList) {
    const id = this.stall()?.id;
    if (!id) return;

    const dto = this._markedListApiService.transformToDto(data);

    const index = dto.list.indexOf(id);
    dto.list.splice(index, 1);

    data.isUpdating = true;
    this._markedListApiService
      .update(data.id, this.user()?.acc!, dto)
      .pipe(
        finalize(() => {
          data.isUpdating = false;
        }),
      )
      .subscribe((res) => {
        if (res.success) {
          this._markedListService.update(dto);
        }
        this.afterUpdate.emit(true);
      });
  }

  addToMarkedList(data: MarkedList) {
    const id = this.stall()?.id;
    if (!id) return;

    const dto = this._markedListApiService.transformToDto(data);
    dto.list.push(id);

    data.isUpdating = true;
    this._markedListApiService
      .update(data.id, this.user()?.acc!, dto)
      .pipe(
        finalize(() => {
          data.isUpdating = false;
        }),
      )
      .subscribe((res) => {
        if (res.success) {
          this._markedListService.update(dto);
        }
        this.afterUpdate.emit(true);
      });
  }
}
