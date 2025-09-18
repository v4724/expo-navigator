import { CommonModule } from '@angular/common';
import {
  AfterViewInit,
  Component,
  HostListener,
  inject,
  signal,
  ViewChild,
  WritableSignal,
} from '@angular/core';
import { allGroupIds } from 'src/app/core/const/row-id';
import { StallDto } from 'src/app/core/interfaces/stall-dto.interface';
import { ModalContext } from 'src/app/core/interfaces/stall-modal.interface';
import { StallModalService } from 'src/app/core/services/state/stall-modal-service';
import { StallService } from 'src/app/core/services/state/stall-service';
import { TooltipService } from 'src/app/core/services/state/tooltip-service';
import { StallData } from '../stall/stall-.interface';
import { UiStateService } from 'src/app/core/services/state/ui-state-service';
import { stallGridRefs } from 'src/app/core/const/official-data';
import { StallMapService } from 'src/app/core/services/state/stall-map-service';
import { MagnifierService } from 'src/app/core/services/state/magnifier-service';
import { StallGroupArea } from '../stall-group-area/stall-group-area';
import { Stall } from '../stall/stall';

@Component({
  selector: 'app-mini-map',
  imports: [CommonModule, Stall, StallGroupArea],
  templateUrl: './mini-map.html',
  styleUrl: './mini-map.scss',
})
export class MiniMap implements AfterViewInit {
  @ViewChild('modalMagnifierWrapper') modalMagnifierWrapper!: HTMLDivElement;
  @ViewChild('modalMagnifier') modalMagnifier!: HTMLDivElement;
  @ViewChild('modalMagnifierStallLayer') modalMagnifierStallLayer!: HTMLDivElement;
  @ViewChild('modalVerticalStallList') modalVerticalStallList!: HTMLDivElement;
  @ViewChild('modalMagnifierRowIndicatorContainer')
  modalMagnifierRowIndicatorContainer!: HTMLDivElement;
  @ViewChild('navUpEl') navUpEl!: HTMLButtonElement;
  @ViewChild('navDownEl') navDownEl!: HTMLButtonElement;
  @ViewChild('navLeftEl') navLeftEl!: HTMLButtonElement;
  @ViewChild('navRightEl') navRightEl!: HTMLButtonElement;

  wasMagnifierVisible: boolean = true;
  isPanning: boolean = true;
  panHappened: boolean = false;
  clickTarget: EventTarget | null = null;
  panStartX: number = 0;
  panStartY: number = 0;
  initialBgX: number = 0;
  initialBgY: number = 0;
  targetBgX: number = 0;
  targetBgY: number = 0;
  // State for smooth panning with requestAnimationFrame
  animationFrameId: number = 0;

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

  private _tooltipService = inject(TooltipService);
  private _stallModalService = inject(StallModalService);
  private _stallService = inject(StallService);
  private _uiStateService = inject(UiStateService);
  private _stallMapService = inject(StallMapService);
  private _magnifierService = inject(MagnifierService);

  selectedStall$ = this._stallService.selectedStall$;
  allStalls$ = this._stallService.allStalls$;
  stallGridRefs = stallGridRefs;

  /**
   * Sets up all event listeners related to the modal.
   * @param context An object containing all necessary dependencies.
   */
  ngAfterViewInit(): void {
    // --- Mini-Map Interaction: Unified Pan and Click for All Devices ---
  }

  onPanStart(e: MouseEvent | TouchEvent) {
    const target = e.target as HTMLElement;
    // Prevent pan from starting if the click is on the vertical stall list.
    if (target.closest('#modal-vertical-stall-list')) {
      return;
    }

    // NEW Check: Prevent pan if clicking the currently active group area.
    const clickedGroupArea = target.closest('.stall-group-area') as HTMLElement | null;
    const currentStallId = this._stallService.selected;
    if (clickedGroupArea && currentStallId) {
      const clickedRowId = clickedGroupArea.dataset['rowId'];
      const currentRowId = currentStallId.substring(0, 1);
      if (clickedRowId === currentRowId) {
        return; // Don't start a pan/drag if clicking the already-active group area.
      }
    }

    // Prevent starting a pan with the right mouse button
    if ('button' in e && e.button !== 0) return;

    this.isPanning = true;
    this.panHappened = false;
    this.clickTarget = e.target;

    const touch = (e as TouchEvent).touches?.[0];
    const clientX = touch ? touch.clientX : (e as MouseEvent).clientX;
    const clientY = touch ? touch.clientY : (e as MouseEvent).clientY;

    this.panStartX = clientX;
    this.panStartY = clientY;

    // Get initial position from the transform property
    const transformMatrix = new DOMMatrix(
      window.getComputedStyle(this.modalMagnifierStallLayer).transform
    );
    this.initialBgX = transformMatrix.e;
    this.initialBgY = transformMatrix.f;
    this.targetBgX = this.initialBgX;
    this.targetBgY = this.initialBgY;

    // Disable transitions during panning for direct control
    this.modalMagnifier.style.transition = 'none';
    this.modalMagnifierStallLayer.style.transition = 'none';

    const highlight = this.modalMagnifierStallLayer.querySelector('.modal-stall-highlight');
    if (highlight) (highlight as HTMLElement).style.visibility = 'hidden';

    cancelAnimationFrame(this.animationFrameId);
    this.animationFrameId = requestAnimationFrame(this.panAnimationLoop);
  }

  onTouchStart(e: TouchEvent) {
    e.stopPropagation();
    this.onPanStart(e);
  }

  onPanMove(e: MouseEvent | TouchEvent) {
    if (!this.isPanning) return;
    if (e.type === 'touchmove') e.preventDefault();

    const touch = (e as TouchEvent).touches?.[0];
    const clientX = touch ? touch.clientX : (e as MouseEvent).clientX;
    const clientY = touch ? touch.clientY : (e as MouseEvent).clientY;

    const dx = clientX - this.panStartX;
    const dy = clientY - this.panStartY;

    if (!this.panHappened && (Math.abs(dx) > 5 || Math.abs(dy) > 5)) {
      this.panHappened = true;
      this.modalMagnifierWrapper.style.cursor = 'grabbing';
    }

    if (this.panHappened) {
      this.targetBgX = this.initialBgX + dx;
      this.targetBgY = this.initialBgY + dy;
    }
  }

  onTouchMove(e: TouchEvent) {
    e.stopPropagation();
    this.onPanMove(e);
  }

  onPanEnd() {
    if (!this.isPanning) return;

    cancelAnimationFrame(this.animationFrameId);

    if (!this.panHappened && this.clickTarget) {
      this.handleModalMapClick(this.clickTarget as HTMLElement);
    }

    this.isPanning = false;
    this.clickTarget = null;
    this.modalMagnifierWrapper.style.cursor = 'grab';

    // Restore transitions for smooth centering next time a stall is selected
    this.modalMagnifier.style.transition = '';
    this.modalMagnifierStallLayer.style.transition = '';
  }

  panAnimationLoop() {
    if (!this.isPanning) return;
    this.setModalMapPosition(this.targetBgX, this.targetBgY);
    this.animationFrameId = requestAnimationFrame(this.panAnimationLoop);
  }

  /**
   * Handles a click/tap event inside the modal mini-map.
   * @param target The event target.
   */
  handleModalMapClick(target: HTMLElement) {
    const allStalls = this._stallService.allStalls;
    const clickedGroupArea = target.closest('.stall-group-area') as HTMLElement | null;
    const clickedStallArea = target.closest(
      '.stall-area:not(.stall-group-area)'
    ) as HTMLElement | null;
    const currentStallId = this._stallService.selected;

    if (clickedGroupArea?.dataset['rowId']) {
      const rowId = clickedGroupArea.dataset['rowId'];
      if (rowId === currentStallId?.substring(0, 1)) {
        return; // Prevent reloading if the clicked row is already active.
      }
      const stallsInRow = allStalls
        .filter((s) => s.id.startsWith(rowId))
        .sort((a, b) => b.num - a.num);
      if (stallsInRow.length > 0) {
        this._stallService.selected = stallsInRow[0].id;
      }
    } else if (clickedStallArea?.dataset['stallId']) {
      const clickedStallId = clickedStallArea.dataset['stallId'];
      if (clickedStallId === currentStallId) {
        return; // Do nothing if the same stall is clicked
      }
      this._stallService.selected = clickedStallId;
    }
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

  // 點擊 地圖-直排
  // 預設 直排點選後的預設 stallId
  verticalStallClicked(e: Event, stall: StallData) {
    const currId = this._stallService.selected;
    const targetId = stall.id;

    this._stallService.selected = targetId;

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
      const currId = this._stallService.selected;
      this.updateNavControls(targetId);
      this.updateVerticalStallList(currId, targetId);
      this._stallService.selected = targetId;
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
      while (stall.num + upStep <= 34) {
        const findId = navigableStalls.find(
          (s) => s.id.startsWith(rowId) && s.num === stall.num + upStep
        )?.id;
        if (findId) {
          upStallId = findId;
          break;
        }
        upStep += 1;
      }
      let downStallId = undefined;
      let downStep = -1;
      while (stall.num + downStep > 0) {
        const findId = navigableStalls.find(
          (s) => s.id.startsWith(rowId) && s.num === stall.num + downStep
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
        modalVerticalStallList.scrollTop = 0;
      }

      const stallsInRow = allStalls
        .filter((s) => s.id.startsWith(rowId))
        .sort((a, b) => b.num - a.num); // Sort numerically descending

      this.verticalStallGroup.set(stallsInRow);
      this.verticalStallGroupHidden.set(false);

      // const searchTerm = elements.searchInput.value.toLowerCase().trim();
      // const searchTerm = '';

      // stallsInRow.forEach((s) => {
      //   const itemEl = document.createElement('div');
      //   itemEl.className = 'modal-vertical-stall-item';
      //   itemEl.dataset['stallId'] = s.id;
      //   itemEl.textContent = s.num.toString().padStart(2, '0');

      //   if (s.promoData.length > 0) {
      //     itemEl.classList.add('has-promo');
      //   }

      //   let isMatch = false;
      //   if (searchTerm !== '') {
      //     const hasPromoUserMatch = s.promoData.some((promo) =>
      //       promo.promoUser.toLowerCase().includes(searchTerm)
      //     );
      //     const hasTagMatch = s.promoTags.some((tag) => tag.toLowerCase().includes(searchTerm));
      //     isMatch =
      //       s.id.toLowerCase().includes(searchTerm) ||
      //       s.stallTitle.toLowerCase().includes(searchTerm) ||
      //       hasPromoUserMatch ||
      //       hasTagMatch;
      //   }
      //   if (isMatch) {
      //     itemEl.classList.add('is-search-match');
      //   }

      //   if (s.id === targetId) {
      //     itemEl.classList.add('is-selected');
      //   }

      //   modalVerticalStallList.appendChild(itemEl);
      // });

      const selectedEl = modalVerticalStallList.querySelector('.is-selected') as HTMLElement;
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
      this.modalMagnifierWrapper.style.display = 'none';
      return;
    }

    this.modalMagnifierWrapper.style.display = 'block';
    this.modalMagnifierWrapper.style.cursor = 'grab';

    const isMobile = this._uiStateService.isMobile();
    const zoomFactor = isMobile ? 4.5 : 1.8;
    const viewW = this.modalMagnifier.offsetWidth;
    const viewH = this.modalMagnifier.offsetHeight;

    if (viewW === 0 || viewH === 0) {
      this.modalMagnifierWrapper.style.display = 'none';
      return;
    }

    const mapImage = this._stallMapService.mapImage;
    const mapW = mapImage?.offsetWidth ?? 0;
    const mapH = mapImage?.offsetHeight ?? 0;
    const scaledMapW = mapW * zoomFactor;
    const scaledMapH = mapH * zoomFactor;

    this.modalMagnifierStallLayer.style.width = `${mapW}px`;
    this.modalMagnifierStallLayer.style.height = `${mapH}px`;
    this.modalMagnifier.style.backgroundSize = `${scaledMapW}px ${scaledMapH}px`;
    this.modalMagnifier.style.backgroundImage = `url('${mapImage?.src}')`;

    const { left, top, width, height } = stall.numericCoords;
    if ([left, top, width, height].some((v) => typeof v !== 'number')) {
      console.error('Could not parse stall coordinates for modal magnifier:', stall.coords);
      this.modalMagnifierWrapper.style.display = 'none';
      return;
    }

    // Calculate the ideal background position to center the stall.
    const stallCenterX_px = ((left + width / 2) / 100) * mapW;
    const stallCenterY_px = ((top + height / 2) / 100) * mapH;
    const bgX = viewW / 2 - stallCenterX_px * zoomFactor;
    const bgY = viewH / 2 - stallCenterY_px * zoomFactor;

    this.setModalMapPosition(bgX, bgY, stall);

    // Update the highlight element's position. It's inside the stall layer now.
    let highlightEl = this.modalMagnifierStallLayer.querySelector(
      '.modal-stall-highlight'
    ) as HTMLElement | null;
    if (!highlightEl) {
      highlightEl = document.createElement('div');
      highlightEl.className = 'modal-stall-highlight';
      this.modalMagnifierStallLayer.appendChild(highlightEl);
    }

    // Use the percentage-based coordinates directly from the stall data for smooth CSS transition.
    highlightEl.style.width = stall.coords.width;
    highlightEl.style.height = stall.coords.height;
    highlightEl.style.left = stall.coords.left;
    highlightEl.style.top = stall.coords.top;
    highlightEl.style.visibility = 'visible';
  }

  /**
   * Sets the position of the mini-map view, clamps it within bounds, culls off-screen elements,
   * and updates the row indicator. It now returns the final clamped background positions.
   * @param context The application context.
   * @param bgX The target horizontal background position.
   * @param bgY The target vertical background position.
   * @param stall The stall being centered on, if any, to ensure accurate row indicator display.
   * @returns An object with the final, clamped background coordinates.
   */
  setModalMapPosition(
    bgX: number,
    bgY: number,
    stall?: StallDto
  ): { clampedBgX: number; clampedBgY: number } {
    const allStalls = this._stallService.allStalls;

    const zoomFactor = this._uiStateService.isMobile() ? 4.5 : 1.8;
    const viewW = this.modalMagnifier.offsetWidth;
    const viewH = this.modalMagnifier.offsetHeight;

    if (viewW === 0 || viewH === 0) return { clampedBgX: 0, clampedBgY: 0 };

    const mapImage = this._stallMapService.mapImage;
    const mapW = mapImage?.offsetWidth ?? 0;
    const mapH = mapImage?.offsetHeight ?? 0;
    if (mapW === 0 || mapH === 0) return { clampedBgX: 0, clampedBgY: 0 };

    const scaledMapW = mapW * zoomFactor;
    const scaledMapH = mapH * zoomFactor;

    const clampedBgX = Math.max(viewW - scaledMapW, Math.min(bgX, 0));
    const clampedBgY = Math.max(viewH - scaledMapH, Math.min(bgY, 0));

    // PERFORMANCE: Use `transform` for movement instead of `left`/`top`.
    this.modalMagnifier.style.backgroundPosition = `${clampedBgX}px ${clampedBgY}px`;
    this.modalMagnifierStallLayer.style.transform = `translate(${clampedBgX}px, ${clampedBgY}px) scale(${zoomFactor})`;

    // --- Viewport Culling for Performance ---
    const bufferX = (viewW / zoomFactor) * 0.5;
    const bufferY = (viewH / zoomFactor) * 0.5;
    const visibleLeft = -clampedBgX / zoomFactor - bufferX;
    const visibleTop = -clampedBgY / zoomFactor - bufferY;
    const visibleRight = (-clampedBgX + viewW) / zoomFactor + bufferX;
    const visibleBottom = (-clampedBgY + viewH) / zoomFactor + bufferY;

    allStalls.forEach((s: StallData) => {
      // const clone = uiState.stallIdToModalCloneMap.get(s.id);
      // if (!clone || !s.numericCoords) return;
      // const { left, top, width, height } = s.numericCoords;
      // const stallLeft_px = (left / 100) * mapW;
      // const stallTop_px = (top / 100) * mapH;
      // const stallRight_px = stallLeft_px + (width / 100) * mapW;
      // const stallBottom_px = stallTop_px + (height / 100) * mapH;
      // const isVisible =
      //   stallLeft_px < visibleRight &&
      //   stallRight_px > visibleLeft &&
      //   stallTop_px < visibleBottom &&
      //   stallBottom_px > visibleTop;
      // clone.classList.toggle('modal-map-hidden', !isVisible);
    });

    stallGridRefs.forEach((group) => {
      // const clone = uiState.rowIdToModalGroupCloneMap.get(group.groupId);
      // if (!clone) return;
      // const rowLeft_px = (group.boundingBox.left / 100) * mapW;
      // const rowTop_px = (group.boundingBox.top / 100) * mapH;
      // const rowRight_px = (group.boundingBox.right / 100) * mapW;
      // const rowBottom_px = (group.boundingBox.bottom / 100) * mapH;
      // const isVisible =
      //   rowLeft_px < visibleRight &&
      //   rowRight_px > visibleLeft &&
      //   rowTop_px < visibleBottom &&
      //   rowBottom_px > visibleTop;
      // clone.classList.toggle('modal-map-hidden', !isVisible);
    });

    this._updateModalRowIndicator(clampedBgX, clampedBgY, stall);

    return { clampedBgX, clampedBgY };
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
  private _updateModalRowIndicator(currentBgX: number, currentBgY: number, stall?: StallDto) {
    const isMobile = this._uiStateService.isMobile();
    const mapImage = this._stallMapService.mapImage;

    this.modalMagnifierRowIndicatorContainer.style.display = 'flex';

    let closestRowData: (typeof stallGridRefs)[0] | null = null;

    if (stall) {
      // Priority 1: Use the provided stall's data for 100% accuracy.
      const rowId = stall.id.substring(0, 1);
      closestRowData = stallGridRefs.find((r) => r.groupId === rowId) ?? null;
    } else {
      // Priority 2 (Fallback for panning): Use geometric calculation based on view center.
      const zoomFactor = isMobile ? 4.5 : 1.8;
      const viewW = this.modalMagnifier.offsetWidth;
      const viewH = this.modalMagnifier.offsetHeight;
      const mapW = mapImage?.offsetWidth ?? 0;
      const mapH = mapImage?.offsetHeight ?? 0;

      if (mapW === 0 || mapH === 0) return;

      // Calculate what point on the original map is now at the center of the view.
      const mapPointAtViewCenterX = (viewW / 2 - currentBgX) / zoomFactor;
      const mapPointAtViewCenterY = (viewH / 2 - currentBgY) / zoomFactor;

      const lensCenterX_pct = (mapPointAtViewCenterX / mapW) * 100;
      const lensCenterY_pct = (mapPointAtViewCenterY / mapH) * 100;

      let minDistanceSq = Infinity;

      for (const row of stallGridRefs) {
        const dx = Math.max(
          row.boundingBox.left - lensCenterX_pct,
          0,
          lensCenterX_pct - row.boundingBox.right
        );
        const dy = Math.max(
          row.boundingBox.top - lensCenterY_pct,
          0,
          lensCenterY_pct - row.boundingBox.bottom
        );
        const distanceSq = dx * dx + dy * dy;

        if (distanceSq < minDistanceSq) {
          minDistanceSq = distanceSq;
          closestRowData = row;
        }
      }
    }

    if (closestRowData && closestRowData.groupId === '範') {
      this._magnifierService.setRowIndicator('', '', '');
    } else {
      this.modalMagnifierRowIndicatorContainer.style.display = 'flex';
      if (closestRowData) {
        const currentIndex = allGroupIds.indexOf(closestRowData.groupId);
        const curr = closestRowData.groupId;
        const prev = currentIndex > 0 ? allGroupIds[currentIndex - 1] : '';
        const next = currentIndex < allGroupIds.length - 1 ? allGroupIds[currentIndex + 1] : '';
        this._magnifierService.setRowIndicator(prev, curr, next);
      } else {
        this._magnifierService.setRowIndicator('', '', '');
      }
    }
  }

  /**
   * Gets the list of stalls that can be navigated through, based on the current search filter.
   * @param allStalls The complete list of all stalls.
   * @param searchTerm The current value from the search input.
   * @returns An array of StallData objects that match the search.
   */
  private _getNavigableStalls(): StallDto[] {
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
    currentStall: StallDto,
    navigableStalls: StallDto[],
    direction: 'up' | 'down' | 'left' | 'right'
  ): string | null => {
    const currentLine = currentStall.id.substring(0, 1);
    const currentNum = currentStall.num;
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
          (s) => s.id.startsWith(currentLine) && s.num === targetNum
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
          let targetStall: StallDto | undefined;

          // If navigating from a vertical row, connect to the top/bottom of the next row.
          if (isCurrentVertical) {
            if (direction === 'down') {
              // Moving DOWN from a vertical row (e.g., 狗 -> 雞).
              // Land on the stall with the HIGHEST number in the target row (the top-most stall).
              targetStall = stallsInTargetRow.sort((a, b) => b.num - a.num)[0];
            } else {
              // direction === 'up'
              // Moving UP from a vertical row (e.g., 雞 -> 狗).
              // Land on the stall with the LOWEST number in the target row (the bottom-most stall).
              targetStall = stallsInTargetRow.sort((a, b) => a.num - b.num)[0];
            }
          } else {
            // Default behavior: find the stall with the closest number.
            targetStall = stallsInTargetRow.find((s) => s.num === currentNum);
            if (!targetStall) {
              targetStall = stallsInTargetRow.sort(
                (a, b) => Math.abs(a.num - currentNum) - Math.abs(b.num - currentNum)
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
        this.navUpEl.click();
        break;
      case 'ArrowDown':
        this.navDownEl.click();
        break;
      case 'ArrowLeft':
        this.navLeftEl.click();
        break;
      case 'ArrowRight':
        this.navRightEl.click();
        break;
    }
  }
}
