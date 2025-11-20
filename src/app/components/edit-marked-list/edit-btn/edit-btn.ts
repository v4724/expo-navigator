import { Component, inject, input } from '@angular/core';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { EditMarkedListModal } from '../edit-marked-list-modal/edit-marked-list-modal';
import { MatIcon } from '@angular/material/icon';
import { MarkedList } from 'src/app/core/interfaces/marked-stall.interface';

@Component({
  selector: 'app-edit-marked-list-btn',
  imports: [MatIcon],
  templateUrl: './edit-btn.html',
  styleUrl: './edit-btn.scss',
})
export class EditBtn {
  data = input<MarkedList>();
  disabled = input<boolean>();

  private readonly _dialog = inject(MatDialog);

  currDialogRef: MatDialogRef<any> | null = null;

  openEditModal(e: Event) {
    e.stopPropagation();
    const dialogRef = this._dialog.open(EditMarkedListModal, {
      hasBackdrop: true, // 有底色
      disableClose: true, // 取消點選背景自動關閉
      width: '80vw',
      maxWidth: '800px',
      height: 'calc(100vh - 100px)',
      panelClass: [''],
      data: {
        list: this.data(),
      },
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
