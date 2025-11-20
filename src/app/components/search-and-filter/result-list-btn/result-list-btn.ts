import { Component, inject } from '@angular/core';
import { ResultList } from '../result-list/result-list';
import { CommonModule } from '@angular/common';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { MatIcon } from '@angular/material/icon';
import { LeftSidebarService } from 'src/app/core/services/state/left-sidebar-service';
import { SearchAndFilterService } from 'src/app/core/services/state/search-and-filter-service';
import { toSignal } from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-result-list-btn',
  imports: [CommonModule, MatIcon],
  templateUrl: './result-list-btn.html',
  styleUrl: './result-list-btn.scss',
})
export class ResultListBtn {
  private readonly _dialog = inject(MatDialog);
  private readonly _leftSidebarService = inject(LeftSidebarService);
  private readonly _searchAndFilterService = inject(SearchAndFilterService);

  currDialogRef: MatDialogRef<any> | null = null;

  isFiltering = toSignal(this._searchAndFilterService.isFiltering$);

  openEditModal() {
    this._openSidebar();
  }

  private _openSidebar() {
    this._leftSidebarService.toggle('filterResults');
  }

  private _openModal() {
    if (this.currDialogRef) {
      return;
    }

    const dialogRef = this._dialog.open(ResultList, {
      hasBackdrop: true, // 有底色
      // disableClose: true, // 取消點選背景自動關閉
      width: '80vw',
      maxWidth: '800px',
      height: 'calc(100vh - 100px)',
      panelClass: [''],
    });

    this.currDialogRef = dialogRef;

    dialogRef.afterClosed().subscribe((result) => {
      console.debug('The dialog was closed');
      if (result !== undefined) {
      }

      this.currDialogRef = null;
    });
  }
}
