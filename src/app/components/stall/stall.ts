import { Component, computed, inject, input, InputSignal, OnInit, signal } from '@angular/core';
import { StallData } from './stall.interface';
import { CommonModule } from '@angular/common';
import { toObservable } from '@angular/core/rxjs-interop';
import { map } from 'rxjs';
import { StallService } from 'src/app/core/services/state/stall-service';
import { StallMapService } from 'src/app/core/services/state/stall-map-service';
import { DraggableService } from 'src/app/core/services/state/draggable-service';
import { UiStateService } from 'src/app/core/services/state/ui-state-service';
import { TooltipService } from 'src/app/core/services/state/tooltip-service';
import { TagService } from 'src/app/core/services/state/tag-service';

import { MarkedStallService } from 'src/app/core/services/state/marked-stall-service';
import { SelectStallService } from 'src/app/core/services/state/select-stall-service';

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
  private _selectStallService = inject(SelectStallService);
  private _stallMapService = inject(StallMapService);
  private _miniMapService = inject(DraggableService);
  private _uiStateService = inject(UiStateService);
  private _tooltipService = inject(TooltipService);
  private _tagService = inject(TagService);
  private _markedStallService = inject(MarkedStallService);

  isGroupedMember$ = toObservable(this.stall).pipe(
    map((stall) => {
      return this._stallService.isGroupedMember(stall.id);
    }),
  );

  isSelected = signal<boolean>(false);
  isSearchMatch = signal<boolean>(false);
  isSeriesMatch = signal<boolean>(false);
  isTagMatch = signal<boolean>(false);
  isMarked = signal<boolean>(false);

  // 避免拖曳地圖後觸發的 click，用於在拖曳時紀錄狀態
  isPanning = false;

  isMatch = computed(() => {
    return this.isSearchMatch() || this.isSeriesMatch() || this.isTagMatch();
  });

  ngOnInit() {
    this._selectStallService.selectedStallId$.subscribe((selectedStall) => {
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

      this.isSearchMatch.set(isMatch);
      this.updateGroupAreaMatch();
    });

    this._tagService.selectedSeriesId$.pipe().subscribe((ids) => {
      const isMatch = this.stall().filterSeries.some((id) => {
        return ids.has(id);
      });
      this.isSeriesMatch.set(isMatch);
      this.updateGroupAreaMatch();
    });

    this._tagService.selectedAdvancedTagsId$.pipe().subscribe((ids) => {
      const isMatch = this.stall().filterTags.some((id) => {
        let isMatch = false;
        Object.keys(ids).forEach((series) => {
          Object.keys(ids[series]).forEach((key) => {
            isMatch = isMatch || ids[series][key].has(id);
          });
        });
        return isMatch;
      });
      this.isTagMatch.set(isMatch);
      this.updateGroupAreaMatch();
    });

    this._markedStallService.show$.pipe().subscribe((val) => {
      if (val) {
        const isMarked = this._markedStallService.isMarked(this.stall().id);
        this.isMarked.set(isMarked);
      } else {
        this.isMarked.set(false);
      }
    });

    // 更新 marked 狀態
    this._markedStallService.sortedMarkedStalls$.pipe().subscribe(() => {
      const isMarked = this._markedStallService.isMarked(this.stall().id);
      this.isMarked.set(isMarked);
    });
  }

  updateGroupAreaMatch() {
    // If a match is found, record its row ID.
    const groupId = this.stall().id.substring(0, 1);
    this._stallMapService.updateMatchStallsId(groupId, this.stall().id, this.isMatch());
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

    this._selectStallService.selected = this.stall().id;
  }
}
