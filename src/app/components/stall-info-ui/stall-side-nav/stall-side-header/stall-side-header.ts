import { CommonModule } from '@angular/common';
import {
  Component,
  computed,
  inject,
  input,
  OnInit,
  output,
  signal,
  WritableSignal,
} from '@angular/core';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { MatIcon } from '@angular/material/icon';
import { PopoverModule } from 'primeng/popover';
import { combineLatest, distinctUntilChanged, finalize, first } from 'rxjs';
import { MarkedList } from 'src/app/core/interfaces/marked-stall.interface';
import { StallData } from 'src/app/core/interfaces/stall.interface';
import { MarkedListApiService } from 'src/app/core/services/api/marked-list-api.service';
import { MarkedStallService } from 'src/app/core/services/state/marked-stall-service';
import { SelectStallService } from 'src/app/core/services/state/select-stall-service';
import { UserService } from 'src/app/core/services/state/user-service';
import { StallZoneBadge } from 'src/app/shared/components/stall-info/stall-zone-badge/stall-zone-badge';

@Component({
  selector: 'app-stall-side-header',
  imports: [CommonModule, MatIcon, PopoverModule, StallZoneBadge],
  templateUrl: './stall-side-header.html',
  styleUrl: './stall-side-header.scss',
})
export class StallSideHeader implements OnInit {
  isPreview = input<boolean>(false);
  previewStall = input<StallData>();
  previewStall$ = toObservable(this.previewStall);

  close = output<boolean>();

  stall: WritableSignal<StallData | undefined> = signal<StallData | undefined>(undefined);
  stall$ = toObservable(this.stall);

  private _markedListApiService = inject(MarkedListApiService);
  private _markedListService = inject(MarkedStallService);
  private _selectStallService = inject(SelectStallService);
  private _userService = inject(UserService);

  isLogin = toSignal(this._userService.isLogin$);
  user = toSignal(this._userService.user$);
  allMarkedList = toSignal(this._markedListService.markedList$);
  markedMapByStallId = toSignal(this._markedListService.markedMapByStallId$);
  isMarkedFetchEnd = toSignal(this._markedListService.fetchEnd$);
  isMarkedSignal = signal(false);

  stallId = computed(() => {
    return this.stall()?.id ?? '';
  });

  isEditable = computed(() => {
    const stall = this.stall();
    const isLogin = this.isLogin();
    if (!stall || !isLogin) return false;
    return this._selectStallService.isEditable();
  });

  ngOnInit() {
    if (this.isPreview()) {
      this.previewStall$.subscribe((stall) => {
        if (stall) {
          this.stall.set(stall);
        }
      });
    } else {
      this._selectStallService.selectedStallId$
        .pipe(distinctUntilChanged())
        .subscribe((stallId) => {
          this.isMarkedSignal.set(false);
          requestAnimationFrame(() => {
            this.stall.set(this._selectStallService.selectedStall);
          });
        });

      // 切換 stall 時更新 marked 狀態
      combineLatest([this.stall$, this._markedListService.fetchEnd$.pipe(first((val) => !!val))])
        .pipe()
        .subscribe(([stall]) => {
          let isMarked = false;
          if (stall) {
            const stallId = stall.id;
            isMarked = this._markedListService.isMarked(stallId);
          }
          this.isMarkedSignal.set(isMarked);
        });
    }
  }

  removeFromMarkedList(data: MarkedList) {
    const dto = this._markedListApiService.transformToDto(data);

    const index = dto.list.indexOf(this.stallId());
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
      });
  }

  addToMarkedList(data: MarkedList) {
    const dto = this._markedListApiService.transformToDto(data);

    dto.list.push(this.stallId());

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
      });
  }

  // 開啟外部連結
  oenpLink() {
    window.open(this.stall()?.stallLink, '_target');
  }

  /**
   * Hides the modal and clears any selection.
   * @param context An object containing all necessary dependencies.
   */
  onClose() {
    if (!this.isPreview()) {
      this._selectStallService.clearSelection();
    }
    this.close.emit(true);
  }
}
