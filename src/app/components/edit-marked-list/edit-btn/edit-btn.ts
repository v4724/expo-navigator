import { Component, inject, input } from '@angular/core';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { EditMarkedListModal } from '../edit-marked-list-modal/edit-marked-list-modal';
import { MatIcon } from '@angular/material/icon';
import { MarkedList } from 'src/app/core/interfaces/marked-stall.interface';
import { DialogService, DynamicDialogRef } from 'primeng/dynamicdialog';
import { UiStateService } from 'src/app/core/services/state/ui-state-service';
import { EditMarkedListHeader } from '../edit-marked-list-header';

@Component({
  selector: 'app-edit-marked-list-btn',
  imports: [MatIcon],
  templateUrl: './edit-btn.html',
  styleUrl: './edit-btn.scss',
})
export class EditBtn {
  data = input<MarkedList>();
  disabled = input<boolean>();

  private _dialogService = inject(DialogService);

  openEditModal(e: Event) {
    e.stopPropagation();
    const dialogRef = this._dialogService.open(EditMarkedListModal, {
      width: '680px',
      height: '90vh',
      inputValues: { data: this.data() },
      closable: false,
      modal: true,
      dismissableMask: false, // 取消點選背景自動關閉
      templates: {
        header: EditMarkedListHeader,
      },
    });
  }
}
