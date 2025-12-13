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
import { distinctUntilChanged, map } from 'rxjs';
import { StallData } from 'src/app/core/interfaces/stall.interface';

import { SelectStallService } from 'src/app/core/services/state/select-stall-service';
import { UserService } from 'src/app/core/services/state/user-service';
import { StallZoneBadge } from 'src/app/shared/components/stall-info/stall-zone-badge/stall-zone-badge';
import { UiStateService } from '../../../../core/services/state/ui-state-service';
import { BookmarkPopover } from 'src/app/shared/components/bookmark-popover/bookmark-popover';

@Component({
  selector: 'app-stall-side-header',
  imports: [CommonModule, MatIcon, PopoverModule, StallZoneBadge, BookmarkPopover],
  templateUrl: './stall-side-header.html',
  styleUrl: './stall-side-header.scss',
})
export class StallSideHeader implements OnInit {
  isPreview = input<boolean>(false);
  previewStall = input<StallData>();
  previewStall$ = toObservable(this.previewStall);

  close = output<boolean>();

  stall: WritableSignal<StallData | undefined> = signal<StallData | undefined>(undefined);
  stall$ = toObservable(this.stall).pipe(map((val) => !!val));

  private _selectStallService = inject(SelectStallService);
  private _userService = inject(UserService);
  private _uiStateService = inject(UiStateService);

  isLogin = toSignal(this._userService.isLogin$);
  user = toSignal(this._userService.user$);

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
          if (this._uiStateService.isPlatformBrowser()) {
            requestAnimationFrame(() => {
              this.stall.set(this._selectStallService.selectedStall);
            });
          }
        });
    }
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
