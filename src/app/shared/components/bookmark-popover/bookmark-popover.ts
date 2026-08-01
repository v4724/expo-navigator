import { CommonModule } from '@angular/common';
import { Component, inject, input, OnInit, signal, ViewChild } from '@angular/core';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { MatIcon } from '@angular/material/icon';
import { PopoverModule } from 'primeng/popover';
import { combineLatest, finalize, first } from 'rxjs';
import { MarkedList } from 'src/app/core/interfaces/marked-stall.interface';
import { StallData } from 'src/app/core/interfaces/stall.interface';
import { MarkedListApiService } from 'src/app/core/services/api/marked-list-api.service';
import { MarkedStallService } from 'src/app/core/services/state/marked-stall-service';
import { UiStateService } from 'src/app/core/services/state/ui-state-service';
import { UserService } from 'src/app/core/services/state/user-service';
import { StallBookmarkPopover } from '../bookmark/stall-bookmark-popover/stall-bookmark-popover';

@Component({
  selector: 'app-bookmark-popover',
  imports: [CommonModule, MatIcon, PopoverModule, StallBookmarkPopover],
  templateUrl: './bookmark-popover.html',
  styleUrl: './bookmark-popover.scss',
})
export class BookmarkPopover implements OnInit {
  @ViewChild(StallBookmarkPopover) markedListPopover!: StallBookmarkPopover;

  isPreview = input<boolean>(false);
  stall = input.required<StallData | undefined>();
  stall$ = toObservable(this.stall);

  private _markedListService = inject(MarkedStallService);
  private _userService = inject(UserService);
  private _uiStateService = inject(UiStateService);

  user = toSignal(this._userService.user$);

  allMarkedList = toSignal(this._markedListService.markedList$);
  markedMapByStallId = toSignal(this._markedListService.markedMapByStallId$);
  isMarkedFetchEnd = toSignal(this._markedListService.fetchEnd$);
  isMarkedSignal = signal(false);

  ngOnInit() {
    if (!this.isPreview()) {
      // 切換 stall 時更新 marked 狀態
      combineLatest([this.stall$, this._markedListService.fetchEnd$.pipe(first((val) => !!val))])
        .pipe()
        .subscribe(([stall]) => {
          this.isMarkedSignal.set(false);
          if (this._uiStateService.isPlatformBrowser()) {
            requestAnimationFrame(() => {
              this.updateMarkedSignal(stall);
            });
          }
        });
    }
  }

  afterUpdate() {
    this.updateMarkedSignal(this.stall());
  }

  updateMarkedSignal(stall: StallData | undefined) {
    let isMarked = false;
    if (stall) {
      const stallId = stall.id;
      isMarked = this._markedListService.isMarked(stallId);
    }
    this.isMarkedSignal.set(isMarked);
  }

  click(e: Event) {
    !this.isPreview() && this.markedListPopover.op.toggle(e);
  }
}
