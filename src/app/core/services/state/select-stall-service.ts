import { inject, Injectable } from '@angular/core';
import { StallService } from './stall-service';
import { BehaviorSubject } from 'rxjs';
import { StallData } from 'src/app/core/interfaces/stall.interface';
import { TooltipService } from './tooltip-service';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { StallInfo } from 'src/app/components/stall-info-ui/stall-info/stall-info';
import { UserService } from './user-service';

@Injectable({
  providedIn: 'root',
})
export class SelectStallService {
  private _selectedId = new BehaviorSubject<string | null>(null);
  selectedStallId$ = this._selectedId.asObservable();

  private _tooltipService = inject(TooltipService);
  private _stallService = inject(StallService);
  private _userService = inject(UserService);
  private readonly _dialog = inject(MatDialog);

  set selected(id: string | null) {
    console.debug('stall-service next selected', id);
    this._selectedId.next(id);
  }

  get selected(): string | null {
    return this._selectedId.getValue();
  }

  get selectedStall(): StallData | undefined {
    const id = this._selectedId.getValue();
    if (!id) return undefined;
    return this._stallService.findStall(id);
  }

  isEditable() {
    const isLogin = this._userService.isLogin;
    const user = this._userService.user;
    const exampleStall = this.selectedStall?.stallZone === '範';
    if (isLogin && user) {
      return user.stallIds.find((id) => id === this.selectedStall?.id) || exampleStall;
    }
    return false;
  }

  hasSelected(): boolean {
    return !!this.selected;
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

  currDialogRef: MatDialogRef<any> | null = null;
  openDialog(): void {
    if (this.currDialogRef) {
      return;
    }

    const dialogRef = this._dialog.open(StallInfo, {
      hasBackdrop: false,
      disableClose: true,
      position: {
        top: '80px',
        right: '20px',
      },
      minWidth: '35vw',
      width: '35vw',
      height: 'calc(100vh - 100px)',
      panelClass: [''],
    });

    this.currDialogRef = dialogRef;

    dialogRef.afterClosed().subscribe((result) => {
      console.debug('The dialog was closed');

      this.selected = null;
      this.currDialogRef = null;
    });
  }
}
