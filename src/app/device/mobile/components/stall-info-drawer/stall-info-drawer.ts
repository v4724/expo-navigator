import { CommonModule } from '@angular/common';
import { Component, computed, inject, input, signal, ViewChild } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { DrawerOnMobile } from 'src/app/shared/components/drawer-on-mobile/drawer-on-mobile';
import { filter, distinctUntilChanged } from 'rxjs';
import { SelectStallService } from 'src/app/core/services/state/select-stall-service';
import { StallMapService } from 'src/app/core/services/state/stall-map-service';
import { StallData } from 'src/app/core/interfaces/stall.interface';
import { StallSideContent } from 'src/app/components/stall-info-ui/stall-side-nav/stall-side-content/stall-side-content';
import { UserService } from 'src/app/core/services/state/user-service';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { MatIcon } from '@angular/material/icon';
import { StallZoneBadge } from 'src/app/shared/components/stall-info/stall-zone-badge/stall-zone-badge';

@Component({
  selector: 'app-stall-info-drawer',
  imports: [CommonModule, ButtonModule, DrawerOnMobile, StallSideContent, MatIcon, StallZoneBadge],
  templateUrl: './stall-info-drawer.html',
  styleUrl: './stall-info-drawer.scss',
})
export class StallInfoDrawer {
  isPreview = input<boolean>(false);
  previewStall = input<StallData>();
  previewStall$ = toObservable(this.previewStall);

  @ViewChild(DrawerOnMobile) drawer!: DrawerOnMobile;

  private _selectStallService = inject(SelectStallService);
  private _stallMapService = inject(StallMapService);
  private _userService = inject(UserService);

  stall = signal<StallData | undefined>(undefined);
  isLogin = toSignal(this._userService.isLogin$);

  isEditable = computed(() => {
    const stall = this.stall();
    const isLogin = this.isLogin();
    if (!stall || !isLogin || this.isPreview()) return false;
    return this._selectStallService.isEditable();
  });

  ngOnInit(): void {
    if (this.isPreview()) {
      this.previewStall$.subscribe((stall) => {
        if (stall) {
          this.stall.set(stall);
        }
      });
    } else {
      this._selectStallService.selectedStallId$.pipe(distinctUntilChanged()).subscribe((id) => {
        if (id) {
          this.show();
          this.stall.set(this._selectStallService.selectedStall);
          setTimeout(() => {
            this._stallMapService.focusStall(id);
          }, 100);
        }
      });
    }
  }

  // 開啟外部連結
  oenpLink() {
    window.open(this.stall()?.stallLink, '_target');
  }

  show() {
    this.drawer?.show();
  }

  close() {
    if (this.drawer.visible) {
      this.drawer?.close();
    }
    this._selectStallService.selected = null;
  }
}
