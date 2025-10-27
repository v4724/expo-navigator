import { CommonModule } from '@angular/common';
import {
  afterNextRender,
  AfterViewInit,
  Component,
  ElementRef,
  HostListener,
  inject,
  NgZone,
  OnInit,
  Renderer2,
  signal,
  ViewChild,
  WritableSignal,
} from '@angular/core';
import { allGroupIds } from 'src/app/core/const/row-id';
import { StallModalService } from 'src/app/core/services/state/stall-modal-service';
import { StallService } from 'src/app/core/services/state/stall-service';
import { TooltipService } from 'src/app/core/services/state/tooltip-service';
import { StallData } from '../../core/interfaces/stall.interface';
import { UiStateService } from 'src/app/core/services/state/ui-state-service';
import { StallMapService } from 'src/app/core/services/state/stall-map-service';
import { MagnifierService } from 'src/app/core/services/state/magnifier-service';
import { StallGroupArea } from '../stall-group-area/stall-group-area';
import { Stall } from '../stall/stall';

import { map, pairwise, startWith } from 'rxjs';
import { GroupIndicator } from '../group-indicator/group-indicator';
import { Draggable, TargetXY } from 'src/app/core/directives/draggable';
import { SelectStallService } from 'src/app/core/services/state/select-stall-service';
import { StallDto } from 'src/app/core/models/stall.model';
import { toSignal } from '@angular/core/rxjs-interop';
import { initial } from 'lodash-es';
import { StallGridDef } from 'src/app/core/interfaces/stall-def.interface';

@Component({
  selector: 'app-mini-map',
  imports: [CommonModule, Stall, StallGroupArea, GroupIndicator, Draggable],
  templateUrl: './mini-map.html',
  styleUrl: './mini-map.scss',
})
export class MiniMap implements OnInit, AfterViewInit {
  @ViewChild('modalMagnifierWrapper') modalMagnifierWrapper!: ElementRef<HTMLDivElement>;
  @ViewChild('draggagleWrapper') draggagleWrapper!: ElementRef<HTMLDivElement>;
  @ViewChild('modalMagnifier') modalMagnifier!: ElementRef<HTMLDivElement>;
  @ViewChild('modalMagnifierStallLayer') modalMagnifierStallLayer!: ElementRef<HTMLDivElement>;
  @ViewChild('modalVerticalStallList') modalVerticalStallList!: ElementRef<HTMLDivElement>;
  @ViewChild('modalMagnifierRowIndicatorContainer')
  modalMagnifierRowIndicatorContainer!: ElementRef<HTMLDivElement>;
  @ViewChild('highlightEl') highlightEl!: ElementRef<HTMLDivElement>;
  @ViewChild('navUpEl') navUpEl!: ElementRef<HTMLButtonElement>;
  @ViewChild('navDownEl') navDownEl!: ElementRef<HTMLButtonElement>;
  @ViewChild('navLeftEl') navLeftEl!: ElementRef<HTMLButtonElement>;
  @ViewChild('navRightEl') navRightEl!: ElementRef<HTMLButtonElement>;

  navControlsTarget = {
    up: { id: '' },
    down: { id: '' },
    left: { id: '' },
    right: { id: '' },
  };

  upDisabled: WritableSignal<boolean> = signal(true);
  downDisabled: WritableSignal<boolean> = signal(true);
  leftDisabled: WritableSignal<boolean> = signal(true);
  rightDisabled: WritableSignal<boolean> = signal(true);
  upVisible: WritableSignal<boolean> = signal(true);
  downVisible: WritableSignal<boolean> = signal(true);
  leftVisible: WritableSignal<boolean> = signal(true);
  rightVisible: WritableSignal<boolean> = signal(true);
  upLabel: WritableSignal<string> = signal('往上一排');
  downLabel: WritableSignal<string> = signal('往下一排');
  leftLabel: WritableSignal<string> = signal('往左一攤');
  rightLabel: WritableSignal<string> = signal('往右一攤');

  verticalStallGroup: WritableSignal<StallData[]> = signal([]);
  verticalStallGroupHidden: WritableSignal<boolean> = signal(true);
  mapImageSrc: WritableSignal<string> = signal('');
  hidden = signal<boolean>(true);
  cursor = signal<'grab' | 'grabbing'>('grab');
  highlightVisible = signal<'visible' | 'hidden'>('hidden');

  mapImgW = signal<number>(0);
  mapImgH = signal<number>(0);
  scaleMapImgW = signal<number>(0);
  scaleMapImgH = signal<number>(0);
  translateX = signal<number>(0);
  translateY = signal<number>(0);

  private _tooltipService = inject(TooltipService);
  private _stallModalService = inject(StallModalService);
  private _stallService = inject(StallService);
  private _selectStallService = inject(SelectStallService);
  private _uiStateService = inject(UiStateService);
  private _stallMapService = inject(StallMapService);
  private _magnifierService = inject(MagnifierService);
  private _renderer = inject(Renderer2);
  private _ngZone = inject(NgZone);

  selectedStall$ = this._selectStallService.selectedStallId$;
  allStalls$ = this._stallService.allStalls$;
  stallGridRefs = toSignal(
    this._stallService.stallZoneDef$.pipe(
      map((def) => {
        return Array.from(def.values() ?? []);
      }),
    ),
  );

  ngOnInit(): void {
    this._stallMapService.mapImage$.pipe().subscribe((el) => {
      this.mapImageSrc.set(`url('${el?.src}')`);

      const zoomFactor = this._uiStateService.zoomFactor();
      const mapImage = this._stallMapService.mapImage;
      const mapW = mapImage?.offsetWidth ?? 0;
      const mapH = mapImage?.offsetHeight ?? 0;
      const scaledMapW = mapW * zoomFactor;
      const scaledMapH = mapH * zoomFactor;

      this.mapImgW.set(mapW);
      this.mapImgH.set(mapH);

      this.scaleMapImgW.set(scaledMapW);
      this.scaleMapImgH.set(scaledMapH);
    });

    this._selectStallService.selectedStallId$
      .pipe(
        startWith(null), // 預設前一個值
        pairwise(),
      )
      .subscribe(([prev, curr]) => {
        if (!curr) return;
        this.updateNavControls(curr);
        this.updateVerticalStallList(prev, curr);
        this.updateHighlight();
      });
  }

  /**
   * Sets up all event listeners related to the modal.
   * @param context An object containing all necessary dependencies.
   */
  ngAfterViewInit(): void {
    // --- Mini-Map Interaction: Unified Pan and Click for All Devices ---
  }

  onPanStart(e: PointerEvent) {
    // Disable transitions during panning for direct control 關掉過渡相關效果
    this._renderer.setStyle(this.modalMagnifier.nativeElement, 'transition', 'none');
    this._renderer.setStyle(this.modalMagnifierStallLayer.nativeElement, 'transition', 'none');
  }

  onPanmove(e: PointerEvent) {
    this.cursor.set('grabbing');
  }

  onPanend(e: PointerEvent) {
    this.cursor.set('grab');
    // Restore transitions for smooth centering next time a stall is selected
    this._renderer.setStyle(this.modalMagnifier.nativeElement, 'transition', '');
    this._renderer.setStyle(this.modalMagnifierStallLayer.nativeElement, 'transition', '');
  }

  navControlMouseover(e: Event) {
    const button = (e.target as HTMLElement).closest('.modal-nav-btn');

    if (button instanceof HTMLButtonElement && !button.disabled) {
      const label = button.ariaLabel;
      if (label) {
        this._tooltipService.show(label, button);
      }
    } else {
      // If the mouse is over the container but not a button (i.e., in a gap), hide the tooltip.
      this._tooltipService.hide();
    }
  }

  navControlMouseleave() {
    this._tooltipService.hide();
  }

  //
  verticalGroupClicked(zone: StallGridDef) {
    const currId = this._selectStallService.selected;
    const targetId = zone.groupDef.defaultStallId
      ? zone.groupDef.defaultStallId
      : `${zone.zoneId}01`;

    this.updateNavControls(targetId);
    this.updateVerticalStallList(currId, targetId);
  }

  // 點擊 nav-上下左右
  navControlsClicked(e: Event, direction: 'up' | 'down' | 'left' | 'right') {
    let targetId = null;
    switch (direction) {
      case 'up':
        targetId = this.navControlsTarget.up.id;
        break;
      case 'down':
        targetId = this.navControlsTarget.down.id;
        break;
      case 'left':
        targetId = this.navControlsTarget.left.id;
        break;
      case 'right':
        targetId = this.navControlsTarget.right.id;
        break;
    }

    if (targetId) {
      const currId = this._selectStallService.selected;
      this.updateNavControls(targetId);
      this.updateVerticalStallList(currId, targetId);
      this._selectStallService.selected = targetId;
    }
  }

  /**
   * 根據 targetId 更新 navControl 狀態、資料
   * @param targetId
   * @returns
   */
  // TODO 修改成根據設定，通用的判斷
  updateNavControls(targetId: string) {
    // --- Update Nav Controls ---
    const navigableStalls = this._getNavigableStalls();
    const rowId = targetId.substring(0, 1);
    const verticalRowIds = ['猴', '雞', '狗', '特', '商'];
    const isVertical = verticalRowIds.includes(rowId);
    const stall = this._stallService.findStall(targetId);

    if (!stall) {
      return;
    }

    if (isVertical) {
      // Special navigation for vertical rows: up/down moves within the row.
      this.leftVisible.set(false);
      this.rightVisible.set(false);
      this.upVisible.set(true);
      this.downVisible.set(true);
      this.upLabel.set('往上一個攤位');
      this.downLabel.set('往下一個攤位');

      // Try to find adjacent stall within the same vertical column first.
      // Up (▲) action is num + 1, Down (▼) action is num - 1.
      let upStallId = undefined;
      let upStep = 1;
      while (stall.stallNum + upStep <= 34) {
        const findId = navigableStalls.find(
          (s) => s.id.startsWith(rowId) && s.stallNum === stall.stallNum + upStep,
        )?.id;
        if (findId) {
          upStallId = findId;
          break;
        }
        upStep += 1;
      }
      let downStallId = undefined;
      let downStep = -1;
      while (stall.stallNum + downStep > 0) {
        const findId = navigableStalls.find(
          (s) => s.id.startsWith(rowId) && s.stallNum === stall.stallNum + downStep,
        )?.id;
        if (findId) {
          downStallId = findId;
          break;
        }
        downStep -= 1;
      }

      // If at the top of the vertical column, find the row "above" (visually).
      if (!upStallId) {
        upStallId = this._getAdjacentStallId(stall, navigableStalls, 'up');
      }

      // If at the bottom of the vertical column, find the row "below" (visually).
      if (!downStallId) {
        downStallId = this._getAdjacentStallId(stall, navigableStalls, 'down');
      }

      console.debug('vertical navIds', upStallId, downStallId);
      this.upDisabled.set(!upStallId);
      this.downDisabled.set(!downStallId);
      this.navControlsTarget.up.id = upStallId ?? '';
      this.navControlsTarget.down.id = downStallId ?? '';

      // Left and Right are never used for vertical rows.
      this.leftDisabled.set(true);
      this.rightDisabled.set(true);
    } else {
      // Standard navigation for horizontal rows
      this.leftVisible.set(true);
      this.rightVisible.set(true);
      this.upVisible.set(true);
      this.downVisible.set(true);
      this.upLabel.set('往上一排');
      this.downLabel.set('往下一排');

      const navIds = {
        up: this._getAdjacentStallId(stall, navigableStalls, 'up'),
        down: this._getAdjacentStallId(stall, navigableStalls, 'down'),
        left: this._getAdjacentStallId(stall, navigableStalls, 'left'),
        right: this._getAdjacentStallId(stall, navigableStalls, 'right'),
      };
      console.debug('navIds', navIds);
      this.upDisabled.set(!navIds.up);
      this.downDisabled.set(!navIds.down);
      this.leftDisabled.set(!navIds.left);
      this.rightDisabled.set(!navIds.right);
      this.navControlsTarget.up.id = navIds.up ?? '';
      this.navControlsTarget.down.id = navIds.down ?? '';
      this.navControlsTarget.left.id = navIds.left ?? '';
      this.navControlsTarget.right.id = navIds.right ?? '';
    }
  }

  /**
   *  Update Vertical Stall List (for vertical rows)
   * @param targetId
   */
  // TODO 修改成根據設定，通用的判斷
  updateVerticalStallList(currId: string | null, targetId: string) {
    const modalVerticalStallList = this.modalVerticalStallList;
    const allStalls = this._stallService.allStalls;

    const rowId = targetId.substring(0, 1);
    const verticalRowIds = ['猴', '雞', '狗', '特', '商'];
    const isVertical = verticalRowIds.includes(rowId);

    // Get the previous row ID before clearing the selection
    const previousRowId = currId?.substring(0, 1) ?? null;

    if (isVertical) {
      // Only reset scroll if we are opening a *different* vertical row.
      if (rowId !== previousRowId) {
        modalVerticalStallList.nativeElement.scrollTop = 0;
      }

      const stallsInRow = allStalls
        .filter((s) => s.id.startsWith(rowId))
        .sort((a, b) => b.stallNum - a.stallNum); // Sort numerically descending
      console.debug('stallsInRow', stallsInRow);
      this.verticalStallGroup.set(stallsInRow);
      this.verticalStallGroupHidden.set(false);

      const selectedEl = modalVerticalStallList.nativeElement.querySelector(
        '.is-selected',
      ) as HTMLElement;
      if (selectedEl) {
        // Defer scrollIntoView to the next animation frame. This ensures the browser
        // has rendered the modal and its contents, allowing the scroll to work correctly,
        // especially when the modal is first opened.
        requestAnimationFrame(() => {
          selectedEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
        });
      }
    } else {
      this.verticalStallGroup.set([]);
      this.verticalStallGroupHidden.set(true);
    }
  }

  /**
   * Updates the integrated mini-map view inside the modal to center on a stall.
   * This function now provides a smooth transition when switching between stalls.
   * @param stall The stall to display and highlight.
   * @param context The application context.
   */
  updateModalMagnifierView(stall: StallData) {
    if (!stall || !stall.coords) {
      this.hidden.set(true);
      this.cursor.set('grab');
      return;
    }

    this.hidden.set(false);
    this.cursor.set('grab');

    requestAnimationFrame(() => {
      const zoomFactor = this._uiStateService.zoomFactor();
      const viewW = this.modalMagnifier.nativeElement.offsetWidth;
      const viewH = this.modalMagnifier.nativeElement.offsetHeight;

      console.debug(viewW, viewH);
      if (viewW === 0 || viewH === 0) {
        this.hidden.set(true);
        return;
      }

      const { left, top, width, height } = stall.coords;
      if ([left, top, width, height].some((v) => typeof v !== 'number')) {
        console.error('Could not parse stall coordinates for modal magnifier:', stall.coords);

        this.hidden.set(true);
        return;
      }

      // Calculate the ideal background position to center the stall.
      const stallCenterX_px = ((left + width / 2) / 100) * this.mapImgW();
      const stallCenterY_px = ((top + height / 2) / 100) * this.mapImgH();
      const bgX = viewW / 2 - stallCenterX_px * zoomFactor;
      const bgY = viewH / 2 - stallCenterY_px * zoomFactor;

      this.setModalMapPosition({ x: bgX, y: bgY }, stall);
    });
  }
  /**
   * Sets the position of the mini-map view, clamps it within bounds, culls off-screen elements,
   * and updates the row indicator. It now returns the final clamped background positions.
   * @param context The application context.
   * @param bgX The target horizontal background position.
   * @param bgY The target vertical background position.
   * @param stall The stall being centered on, if any, to ensure accurate row indicator display.
   */
  setModalMapPosition(targetBgXY: TargetXY, stall?: StallData) {
    const bgX = targetBgXY.x;
    const bgY = targetBgXY.y;
    const zoomFactor = this._uiStateService.zoomFactor();
    const viewW = this.modalMagnifier.nativeElement.offsetWidth;
    const viewH = this.modalMagnifier.nativeElement.offsetHeight;

    if (viewW === 0 || viewH === 0) return;

    const mapImage = this._stallMapService.mapImage;
    const mapW = mapImage?.offsetWidth ?? 0;
    const mapH = mapImage?.offsetHeight ?? 0;
    if (mapW === 0 || mapH === 0) return;

    // 計算縮放後的地圖大小
    const scaledMapW = mapW * zoomFactor;
    const scaledMapH = mapH * zoomFactor;

    // 限制（Clamp）地圖偏移量
    const clampedBgX = Math.max(viewW - scaledMapW, Math.min(bgX, 0));
    const clampedBgY = Math.max(viewH - scaledMapH, Math.min(bgY, 0));

    console.debug('viewWH', viewW, viewH);
    console.debug('scaledMapWH', scaledMapW, scaledMapH);
    console.debug('X', viewW - scaledMapW, Math.min(bgX, 0));
    console.debug('Y', viewH - scaledMapH, Math.min(bgY, 0));
    console.debug('地圖偏移量', clampedBgX, clampedBgY);
    // PERFORMANCE: Use `transform` for movement instead of `left`/`top`.
    // 背景位置
    this._renderer.setStyle(
      this.modalMagnifier.nativeElement,
      'backgroundPosition',
      `${clampedBgX}px ${clampedBgY}px`,
    );

    // 攤位圖層（前景，通常是可互動的元素）
    this._renderer.setStyle(
      this.modalMagnifierStallLayer.nativeElement,
      'transform',
      `translate(${clampedBgX}px, ${clampedBgY}px) scale(${zoomFactor})`,
    );

    this.translateX.set(clampedBgX);
    this.translateY.set(clampedBgY);

    this._updateModalRowIndicator(clampedBgX, clampedBgY, stall);
  }

  updateHighlight() {
    const stall = this._selectStallService.selectedStall;
    if (!stall) {
      return;
    }
    // Update the highlight element's position. It's inside the stall layer now.
    // Use the percentage-based coordinates directly from the stall data for smooth CSS transition.
    this.highlightVisible.set('visible');
    this._renderer.setStyle(this.highlightEl.nativeElement, 'width', `${stall.coords.width}`);
    this._renderer.setStyle(this.highlightEl.nativeElement, 'height', `${stall.coords.height}`);
    this._renderer.setStyle(this.highlightEl.nativeElement, 'left', `${stall.coords.left}`);
    this._renderer.setStyle(this.highlightEl.nativeElement, 'top', `${stall.coords.top}`);
  }

  /**
   * Updates the modal's row indicator. It prioritizes using the explicit `stall`
   * for accuracy when selecting, and falls back to a geometric calculation based
   * on the view's center when panning. It also hides the indicator for the '範' stall.
   * @param context The application context.
   * @param currentBgX The current horizontal background position of the map.
   * @param currentBgY The current vertical background position of the map.
   * @param stall The currently selected stall, if any.
   */
  private _updateModalRowIndicator(currentBgX: number, currentBgY: number, stall?: StallData) {
    const mapImage = this._stallMapService.mapImage;

    let closestRowData = null;

    if (stall) {
      // Priority 1: Use the provided stall's data for 100% accuracy.
      const rowId = stall.id.substring(0, 1);
      closestRowData = (this.stallGridRefs() ?? []).find((r) => r.zoneId === rowId) ?? null;
    } else {
      // Priority 2 (Fallback for panning): Use geometric calculation based on view center.
      const zoomFactor = this._uiStateService.zoomFactor();
      const viewW = this.modalMagnifier.nativeElement.offsetWidth;
      const viewH = this.modalMagnifier.nativeElement.offsetHeight;
      const mapW = mapImage?.offsetWidth ?? 0;
      const mapH = mapImage?.offsetHeight ?? 0;

      if (mapW === 0 || mapH === 0) return;

      // Calculate what point on the original map is now at the center of the view.
      const mapPointAtViewCenterX = (viewW / 2 - currentBgX) / zoomFactor;
      const mapPointAtViewCenterY = (viewH / 2 - currentBgY) / zoomFactor;

      const lensCenterX_pct = (mapPointAtViewCenterX / mapW) * 100;
      const lensCenterY_pct = (mapPointAtViewCenterY / mapH) * 100;

      let minDistanceSq = Infinity;

      for (const zone of Array.from(this.stallGridRefs()?.values() ?? [])) {
        const dx = Math.max(
          zone.groupDef.boundingBox.left - lensCenterX_pct,
          0,
          lensCenterX_pct - zone.groupDef.boundingBox.right,
        );
        const dy = Math.max(
          zone.groupDef.boundingBox.top - lensCenterY_pct,
          0,
          lensCenterY_pct - zone.groupDef.boundingBox.bottom,
        );
        const distanceSq = dx * dx + dy * dy;

        if (distanceSq < minDistanceSq) {
          minDistanceSq = distanceSq;
          closestRowData = zone;
        }
      }
    }

    // 在 raf 要用 ngZone 強制更新畫面
    this._ngZone.run(() => {
      // 更新多個值
      if (closestRowData && closestRowData.zoneId === '範') {
        this._magnifierService.setRowIndicator('', '', '');
      } else {
        if (closestRowData) {
          const currentIndex = allGroupIds.indexOf(closestRowData.zoneId);
          const curr = closestRowData.zoneId;
          const prev = currentIndex > 0 ? allGroupIds[currentIndex - 1] : '';
          const next = currentIndex < allGroupIds.length - 1 ? allGroupIds[currentIndex + 1] : '';
          this._magnifierService.setRowIndicator(prev, curr, next);
        } else {
          this._magnifierService.setRowIndicator('', '', '');
        }
      }
    });
  }

  /**
   * Gets the list of stalls that can be navigated through, based on the current search filter.
   * @param allStalls The complete list of all stalls.
   * @param searchTerm The current value from the search input.
   * @returns An array of StallData objects that match the search.
   */
  private _getNavigableStalls(): StallData[] {
    return this._stallService.allStalls;
  }

  /**
   * Finds the ID of an adjacent stall based on the map's layout.
   * @param currentStall The stall to navigate from.
   * @param navigableStalls The list of currently visible/search-matched stalls.
   * @param direction 'up', 'down', 'left', or 'right'.
   * @returns The ID of the adjacent stall, or null if none exists.
   */
  private _getAdjacentStallId = (
    currentStall: StallData,
    navigableStalls: StallData[],
    direction: 'up' | 'down' | 'left' | 'right',
  ): string | null => {
    const currentLine = currentStall.id.substring(0, 1);
    const currentNum = currentStall.stallNum;
    const isCurrentVertical = ['狗', '雞', '猴', '特', '商'].includes(currentLine);
    const currentRowIndex = allGroupIds.indexOf(currentLine);

    if (
      direction === 'right' &&
      currentLine >= 'A' &&
      currentLine <= 'Q' &&
      (currentNum === 1 || currentNum === 72)
    ) {
      return null;
    }

    if (direction === 'left' || direction === 'right') {
      const horizDirection = direction === 'right' ? 'prev' : 'next';
      const isReversed = !isCurrentVertical && !(currentNum >= 1 && currentNum <= 36);
      const step = horizDirection === 'next' ? 1 : -1;
      const directionStep = isReversed ? -step : step;

      let targetNum = currentNum + directionStep;
      while (targetNum >= 1 && targetNum <= 72) {
        const foundStallInRow = navigableStalls.find(
          (s) => s.id.startsWith(currentLine) && s.stallNum === targetNum,
        );
        if (foundStallInRow) return foundStallInRow.id;

        targetNum += directionStep;
      }

      // Wrap to adjacent row (logic only for up/down visual movement)
      return null;
    }

    if (direction === 'up' || direction === 'down') {
      if (currentRowIndex === -1) return null;
      // Moving 'up' on the map means going from row A -> B, or 猴 -> 雞, which is an increase in the allRowIds index.
      const step = direction === 'up' ? 1 : -1;

      let targetRowIndex = currentRowIndex + step;
      while (targetRowIndex >= 0 && targetRowIndex < allGroupIds.length) {
        const targetRowId = allGroupIds[targetRowIndex];
        const stallsInTargetRow = navigableStalls.filter((s) => s.id.startsWith(targetRowId));
        if (stallsInTargetRow.length > 0) {
          let targetStall: StallData | undefined;

          // If navigating from a vertical row, connect to the top/bottom of the next row.
          if (isCurrentVertical) {
            if (direction === 'down') {
              // Moving DOWN from a vertical row (e.g., 狗 -> 雞).
              // Land on the stall with the HIGHEST number in the target row (the top-most stall).
              targetStall = stallsInTargetRow.sort((a, b) => b.stallNum - a.stallNum)[0];
            } else {
              // direction === 'up'
              // Moving UP from a vertical row (e.g., 雞 -> 狗).
              // Land on the stall with the LOWEST number in the target row (the bottom-most stall).
              targetStall = stallsInTargetRow.sort((a, b) => a.stallNum - b.stallNum)[0];
            }
          } else {
            // Default behavior: find the stall with the closest number.
            targetStall = stallsInTargetRow.find((s) => s.stallNum === currentNum);
            if (!targetStall) {
              targetStall = stallsInTargetRow.sort(
                (a, b) => Math.abs(a.stallNum - currentNum) - Math.abs(b.stallNum - currentNum),
              )[0];
            }
          }
          return targetStall?.id || null;
        }
        targetRowIndex += step; // continue searching in the same direction
      }
    }

    return null;
  };

  @HostListener('keydown', ['$event'])
  keydownHandler(e: KeyboardEvent) {
    if (this._stallModalService.isHidden()) return;

    switch (e.key) {
      case 'ArrowUp':
        this.navUpEl.nativeElement.click();
        break;
      case 'ArrowDown':
        this.navDownEl.nativeElement.click();
        break;
      case 'ArrowLeft':
        this.navLeftEl.nativeElement.click();
        break;
      case 'ArrowRight':
        this.navRightEl.nativeElement.click();
        break;
    }
  }
}
