import { Component, inject, input, InputSignal, OnInit, signal } from '@angular/core';
import { StallData } from './stall-.interface';
import { CommonModule } from '@angular/common';
import { toObservable } from '@angular/core/rxjs-interop';
import { map } from 'rxjs';
import { StallService } from 'src/app/core/services/state/stall-service';
import { StallMapService } from 'src/app/core/services/state/stall-map-service';
import { DraggableService } from 'src/app/core/services/state/draggable-service';
import { MagnifierService } from 'src/app/core/services/state/magnifier-service';
import { UiStateService } from 'src/app/core/services/state/ui-state-service';
import { TooltipService } from 'src/app/core/services/state/tooltip-service';

@Component({
  selector: 'app-stall',
  imports: [CommonModule],
  templateUrl: './stall.html',
  styleUrl: './stall.scss',
})
export class Stall implements OnInit {
  stall: InputSignal<StallData> = input.required();
  absolutePosition = input();
  hiddenIfGrouped = input();

  private _stallService = inject(StallService);
  private _stallMapService = inject(StallMapService);
  private _miniMapService = inject(DraggableService);
  private _uiStateService = inject(UiStateService);
  private _tooltipService = inject(TooltipService);

  isGroupedMember$ = toObservable(this.stall).pipe(
    map((stall) => {
      return this._stallService.isGroupedMember(stall.id);
    }),
  );

  isSelected = signal<boolean>(false);
  isSearchMatch = signal<boolean>(false);

  isPanning = false;

  ngOnInit() {
    this._stallService.selectedStallId$.subscribe((selectedStall) => {
      this.isSelected.set(this.stall().id === selectedStall);
    });

    this._stallMapService.inputSearch$.subscribe((searchTerm) => {
      let isMatch = false;
      if (searchTerm !== '') {
        const hasPromoUserMatch = this.stall().promoData.some((promo) =>
          promo.promoUser.toLowerCase().includes(searchTerm),
        );
        const hasTagMatch = this.stall().promoTags.some((tag) =>
          tag.toLowerCase().includes(searchTerm),
        );

        isMatch =
          this.stall().id.toLowerCase().includes(searchTerm) ||
          this.stall().stallTitle.toLowerCase().includes(searchTerm) ||
          hasPromoUserMatch ||
          hasTagMatch;
      }

      if (isMatch) {
        // If a match is found, record its row ID.
        const groupId = this.stall().id.substring(0, 1);
        this._stallMapService.inputSearchMatchGroupId = groupId;
      }
      this.isSearchMatch.set(isMatch);
    });

    this._miniMapService.isDragging$.subscribe(() => {});
  }

  mousemove() {
    if (this._miniMapService.isDragging) {
      this.isPanning = true;
    } else {
      this.isPanning = false;
    }
  }

  mouseover(e: MouseEvent) {
    if (this._uiStateService.isSmallScreen()) return;

    const target = e.target as HTMLElement;
    const promoUsers = this.stall()
      .promoData?.map((o) => o.promoUser)
      .filter((value, index, self) => self.indexOf(value) === index)
      .join(',');
    const innerHTML = `<strong>${this.stall().stallTitle}</strong><br><small>${this.stall().id}${
      promoUsers ? ` / ${promoUsers}` : ''
    }</small>`;
    this._tooltipService.show(innerHTML, target);
  }

  mouseout(e: MouseEvent) {
    if (this._uiStateService.isSmallScreen()) return;

    this._tooltipService.hide();
  }

  stallClicked() {
    if (this.isPanning) {
      this.isPanning = false;
      return;
    }

    this._stallService.selected = this.stall().id;
  }
}
