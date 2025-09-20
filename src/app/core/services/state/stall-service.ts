import { inject, Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { StallDto } from '../../interfaces/stall-dto.interface';
import { StallData } from 'src/app/components/stall/stall-.interface';
import { TooltipService } from './tooltip-service';
import { stallGridRefs } from '../../const/official-data';

@Injectable({
  providedIn: 'root',
})
export class StallService {
  private _allStalls = new BehaviorSubject<StallData[]>([]);
  private _selectedId = new BehaviorSubject<string | null>(null);
  private _allOrigStalls = new BehaviorSubject<StallDto[]>([]);

  // This set contains rows that are *permanently* grouped on all screen sizes.
  permanentlyGroupedRowIds = new Set(
    stallGridRefs.filter((r) => r.isGrouped).map((r) => r.groupId)
  );

  allStalls$ = this._allStalls.asObservable();
  selectedStallId$ = this._selectedId.asObservable();

  private _tooltipService = inject(TooltipService);

  get selected(): string | null {
    return this._selectedId.getValue();
  }
  get selectedStall(): StallData | undefined {
    const id = this._selectedId.getValue();
    if (!id) return undefined;
    return this.findStall(id);
  }

  set selected(id: string | null) {
    console.debug('stall-service next selected', id);
    this._selectedId.next(id);
  }

  set allStalls(stalls: StallData[]) {
    this._allStalls.next(stalls);
  }
  get allStalls() {
    return this._allStalls.getValue();
  }

  hasSelected(): boolean {
    return !!this.selected;
  }

  findStall(id: string): StallData | undefined {
    return this._allStalls.getValue().find((stall) => stall.id === id);
  }

  isGroupedMember(stallId: string) {
    // Stalls that are members of a permanently grouped row are hidden on the main map (on all screen sizes).
    const rowId = stallId.substring(0, 1);
    return this.permanentlyGroupedRowIds.has(rowId);
  }

  /**
   * Clears the currently selected stall, resetting its style and hiding the tooltip.
   * @param elements A reference to all DOM elements.
   * @param magnifierController The controller for the desktop magnifier.
   * @param state The shared UI state object.
   */
  clearSelection() {
    // state: UIState // magnifierController: MagnifierController | null, // elements: DOMElements,
    if (this.hasSelected()) {
      // updateStallClass(
      //   state.selectedStallElement,
      //   'is-selected',
      //   false,
      //   magnifierController,
      //   state
      // );
    }
    this.selected = null;
    this._tooltipService.hide();
  }
}
