import { CommonModule } from '@angular/common';
import { Component, computed, inject, OnInit, ViewChild } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { toSignal } from '@angular/core/rxjs-interop';
import { MarkedStallService } from 'src/app/core/services/state/marked-stall-service';
import { OnlyArea } from 'src/app/components/layers-controller/only-area/only-area';
import { StallsLayer } from 'src/app/components/layers-controller/stalls-layer/stalls-layer';
import { DrawerOnMobile } from 'src/app/shared/components/drawer-on-mobile/drawer-on-mobile';
import { FormsModule } from '@angular/forms';
import { ToggleSwitch } from 'primeng/toggleswitch';
import { AreaService } from 'src/app/core/services/state/area-service';
import { MatIcon } from '@angular/material/icon';

@Component({
  selector: 'app-only-area-drawer',
  imports: [CommonModule, ButtonModule, ToggleSwitch, FormsModule, DrawerOnMobile, MatIcon],
  templateUrl: './only-area-drawer.html',
  styleUrl: './only-area-drawer.scss',
})
export class OnlyAreaDrawer implements OnInit {
  @ViewChild(DrawerOnMobile) drawer!: DrawerOnMobile;

  private _areaService = inject(AreaService);

  // Data
  // 場內 only
  areaFetchEnd = toSignal(this._areaService.fetchEnd$);
  allAreas = computed(() => {
    if (!this.areaFetchEnd()) return [];

    return this._areaService.allAreas;
  });

  checked = false;

  ngOnInit() {
    this._areaService.show$.pipe().subscribe((val) => {
      this.checked = val;
    });
  }

  show() {
    this.drawer.show();
  }

  close() {
    this.drawer.close();
  }

  toggleLayer() {
    this._areaService.toggleLayer();
  }

  toggleArea(areaId: string) {
    this._areaService.toggleArea(areaId);
  }
}
