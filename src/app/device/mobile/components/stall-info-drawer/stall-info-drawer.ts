import { CommonModule } from '@angular/common';
import { Component, inject, ViewChild } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { DrawerOnMobile } from 'src/app/shared/components/drawer-on-mobile/drawer-on-mobile';
import { StallSideNav } from 'src/app/components/stall-info-ui/stall-side-nav/stall-side-nav';
import { filter, distinctUntilChanged } from 'rxjs';
import { SelectStallService } from 'src/app/core/services/state/select-stall-service';
import { StallMapService } from 'src/app/core/services/state/stall-map-service';

@Component({
  selector: 'app-stall-info-drawer',
  imports: [CommonModule, ButtonModule, StallSideNav, DrawerOnMobile],
  templateUrl: './stall-info-drawer.html',
  styleUrl: './stall-info-drawer.scss',
})
export class StallInfoDrawer {
  @ViewChild(DrawerOnMobile) drawer!: DrawerOnMobile;

  private _selectStallService = inject(SelectStallService);
  private _stallMapService = inject(StallMapService);

  ngOnInit(): void {
    this._selectStallService.selectedStallId$
      .pipe(
        filter((id) => !!id),
        distinctUntilChanged(),
      )
      .subscribe((id) => {
        this.show();
        if (id) {
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
