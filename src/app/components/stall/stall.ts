import {
  AfterViewInit,
  Component,
  computed,
  ElementRef,
  inject,
  input,
  InputSignal,
  OnInit,
  signal,
  ViewChild,
} from '@angular/core';
import { StallData } from './stall.interface';
import { CommonModule } from '@angular/common';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { map } from 'rxjs';
import { StallService } from 'src/app/core/services/state/stall-service';
import { StallMapService } from 'src/app/core/services/state/stall-map-service';
import { DraggableService } from 'src/app/core/services/state/draggable-service';
import { UiStateService } from 'src/app/core/services/state/ui-state-service';
import { TooltipService } from 'src/app/core/services/state/tooltip-service';
import { TagService } from 'src/app/core/services/state/tag-service';

import { MarkedStallService } from 'src/app/core/services/state/marked-stall-service';
import { SelectStallService } from 'src/app/core/services/state/select-stall-service';
import { StallLayerService } from 'src/app/core/services/state/stall-layer-service';
import { MatIcon } from '@angular/material/icon';
import { UserService } from 'src/app/core/services/state/user-service';
@Component({
  selector: 'app-stall',
  imports: [CommonModule, MatIcon],
  templateUrl: './stall.html',
  styleUrl: './stall.scss',
})
export class Stall implements OnInit, AfterViewInit {
  @ViewChild('stallRef') stallRef!: ElementRef<HTMLDivElement>;

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
  private _stallLayerService = inject(StallLayerService);
  private _userService = inject(UserService);

  isGroupedMember$ = toObservable(this.stall).pipe(
    map((stall) => {
      return this._stallService.isGroupedMember(stall.id);
    }),
  );

  fontSize = signal<string>('0.5rem');

  showStallLayer = toSignal(this._stallLayerService.show$);
  showMarkLayer = toSignal(this._markedStallService.show$);
  isLogin = toSignal(this._userService.isLogin$);

  isSelected = signal<boolean>(false);
  isSearchMatch = signal<boolean>(false);
  isSeriesMatch = signal<boolean>(false);
  isTagMatch = signal<boolean>(false);
  isMarked = signal<boolean>(false);

  markedXY = computed(() => {
    let x = 0;
    let y = 0;
    if (this.absolutePosition()) {
      let top = Number(this.stall().coords.top);
      let left = Number(this.stall().coords.left);
      x = left + Number(this.stall().coords.width) / 3;
      y = top;
    }

    return {
      x,
      y,
    };
  });

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
        const hasPromoTitleMatch = this.stall().promoData.some((promo) =>
          promo.promoTitle.toLowerCase().includes(searchTerm),
        );
        const hasTagMatch = this.stall().filterCustomTags.some((tag) =>
          tag.toLowerCase().includes(searchTerm),
        );

        isMatch =
          this.stall().id.toLowerCase().includes(searchTerm) ||
          this.stall().stallTitle.toLowerCase().includes(searchTerm) ||
          hasPromoTitleMatch ||
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
        Object.keys(ids).forEach((seriesId) => {
          const numId = Number(seriesId);
          Object.keys(ids[numId] ?? []).forEach((key) => {
            isMatch = isMatch || ids[numId][key].has(id);
          });
        });
        return isMatch;
      });
      this.isTagMatch.set(isMatch);
      this.updateGroupAreaMatch();
    });

    // 更新 marked 狀態
    this._markedStallService.sortedMarkedStalls$.pipe().subscribe(() => {
      const isLogin = this.isLogin();
      const isMarked = this._markedStallService.isMarked(this.stall().id);
      this.isMarked.set(isMarked);
    });
  }

  ngAfterViewInit(): void {
    const resizeObserver = new ResizeObserver(() => {
      this.resizeHandler();
    });
    resizeObserver.observe(this.stallRef.nativeElement);
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
    const promoTitles = this.stall()
      .promoData?.map((o) => o.promoTitle)
      .filter((value, index, self) => self.indexOf(value) === index)
      .join(',');
    const innerHTML = `<strong>${this.stall().stallTitle}</strong><br><small>${this.stall().id}${
      promoTitles ? ` / ${promoTitles}` : ''
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

  resizeHandler() {
    const mapH = this._stallMapService.mapImage?.height ?? 0;
    if (mapH) {
      const h = (Number(this.stall().coords.height) * mapH) / 100;
      const fontSize = h * 0.7;
      this.fontSize.set(`${fontSize}px`);
    } else {
      this.fontSize.set('0.5rem');
    }
  }
}
