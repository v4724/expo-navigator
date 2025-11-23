import { CommonModule } from '@angular/common';
import { Component, computed, inject, signal, ViewChild } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { DrawerOnMobile } from 'src/app/shared/components/drawer-on-mobile/drawer-on-mobile';
import { filter, distinctUntilChanged } from 'rxjs';
import { SelectStallService } from 'src/app/core/services/state/select-stall-service';
import { StallMapService } from 'src/app/core/services/state/stall-map-service';
import { StallData } from 'src/app/core/interfaces/stall.interface';
import { StallSideContent } from 'src/app/components/stall-info-ui/stall-side-nav/stall-side-content/stall-side-content';
import { EditBtn } from 'src/app/components/edit-stall/edit-btn/edit-btn';
import { UserService } from 'src/app/core/services/state/user-service';
import { toSignal } from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-stall-info-drawer',
  imports: [CommonModule, ButtonModule, EditBtn, DrawerOnMobile, StallSideContent],
  templateUrl: './stall-info-drawer.html',
  styleUrl: './stall-info-drawer.scss',
})
export class StallInfoDrawer {
  @ViewChild(DrawerOnMobile) drawer!: DrawerOnMobile;

  private _selectStallService = inject(SelectStallService);
  private _stallMapService = inject(StallMapService);
  private _userService = inject(UserService);

  stall = signal<StallData | undefined>(undefined);
  isLogin = toSignal(this._userService.isLogin$);

  isEditable = computed(() => {
    const stall = this.stall();
    const isLogin = this.isLogin();
    if (!stall || !isLogin) return false;
    return this._selectStallService.isEditable();
  });

  ngOnInit(): void {
    this._selectStallService.selectedStallId$
      .pipe(
        filter((id) => !!id),
        distinctUntilChanged(),
      )
      .subscribe((id) => {
        this.show();
        if (id) {
          this.stall.set(this._selectStallService.selectedStall);
          setTimeout(() => {
            this._stallMapService.focusStall(id);
          }, 100);
        }
      });
  }

  show() {
    this.drawer.show();
  }

  close() {
    this.drawer.close();
  }
}
