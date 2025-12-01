import { Component, inject } from '@angular/core';
import { ResultList } from '../result-list/result-list';
import { CommonModule } from '@angular/common';
import { LeftSidebarService } from 'src/app/core/services/state/left-sidebar-service';
import { SearchAndFilterService } from 'src/app/core/services/state/search-and-filter-service';
import { toSignal } from '@angular/core/rxjs-interop';
import { DialogService, DynamicDialogRef } from 'primeng/dynamicdialog';
import { Button } from 'primeng/button';

@Component({
  selector: 'app-result-list-btn',
  imports: [CommonModule, Button],
  templateUrl: './result-list-btn.html',
  styleUrl: './result-list-btn.scss',
})
export class ResultListBtn {
  private readonly _dialog = inject(DialogService);
  private readonly _leftSidebarService = inject(LeftSidebarService);
  private readonly _searchAndFilterService = inject(SearchAndFilterService);

  currDialogRef: DynamicDialogRef<any> | null = null;

  isFiltering = toSignal(this._searchAndFilterService.isFiltering$);

  openModal() {
    this._openSidebar();
  }

  private _openSidebar() {
    this._leftSidebarService.toggle('filterResults');
  }

  private _openModal() {
    if (this.currDialogRef) {
      return;
    }

    this.currDialogRef = this._dialog.open(ResultList, {
      showHeader: false,
      modal: false,
      dismissableMask: false,
      width: '500px',
      height: 'calc(100vh - 100px)',
    });

    this.currDialogRef?.onClose.subscribe(() => {
      this.currDialogRef = null;
    });
  }
}
