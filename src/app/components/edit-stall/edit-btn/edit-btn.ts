import { Component, inject } from '@angular/core';

import { EditStallModal } from '../../edit-stall/edit-stall-modal/edit-stall-modal';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { CommonModule } from '@angular/common';
import { MatIcon } from '@angular/material/icon';

@Component({
  selector: 'app-edit-btn',
  imports: [CommonModule, MatIcon],
  templateUrl: './edit-btn.html',
  styleUrl: './edit-btn.scss',
})
export class EditBtn {
  private readonly _dialog = inject(MatDialog);

  currDialogRef: MatDialogRef<any> | null = null;

  openEditModal() {
    const dialogRef = this._dialog.open(EditStallModal, {
      hasBackdrop: true, // 有底色
      disableClose: true, // 取消點選背景自動關閉
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
