import { CommonModule } from '@angular/common';
import { Component, computed, inject, OnInit, ViewChild } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { MatIcon } from '@angular/material/icon';
import { ButtonModule } from 'primeng/button';
import { Popover, PopoverModule } from 'primeng/popover';
import { ToggleSwitch } from 'primeng/toggleswitch';
import { AreaService } from 'src/app/core/services/state/area-service';

@Component({
  selector: 'app-only-area-btn',
  imports: [CommonModule, PopoverModule, ToggleSwitch, FormsModule, ButtonModule, MatIcon],
  templateUrl: './only-area-btn.html',
  styleUrl: './only-area-btn.scss',
})
export class OnlyAreaBtn implements OnInit {
  @ViewChild(Popover) popover!: Popover;

  private _areaService = inject(AreaService);

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

  toggleLayer() {
    this._areaService.toggleLayer();
  }

  openUrl(url: string) {
    url && window.open(url);
  }
}
