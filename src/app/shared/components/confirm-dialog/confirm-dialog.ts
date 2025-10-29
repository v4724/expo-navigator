import { Component, inject, model, OnInit, signal } from '@angular/core';
import {
  MAT_DIALOG_DATA,
  MatDialogActions,
  MatDialogClose,
  MatDialogContent,
  MatDialogRef,
  MatDialogTitle,
} from '@angular/material/dialog';
import { ButtonModule } from 'primeng/button';

export interface DialogData {
  title?: string;
  label: string;
}
@Component({
  selector: 'app-confirm-dialog',
  imports: [ButtonModule, MatDialogTitle, MatDialogContent, MatDialogActions, MatDialogClose],
  templateUrl: './confirm-dialog.html',
  styleUrl: './confirm-dialog.scss',
})
export class ConfirmDialog implements OnInit {
  readonly dialogRef = inject(MatDialogRef<ConfirmDialog>);
  readonly data = inject<DialogData>(MAT_DIALOG_DATA);

  readonly title = model(this.data.title);
  readonly label = model(this.data.label);

  ngOnInit(): void {}

  onNoClick(): void {
    this.dialogRef.close();
  }

  confirm() {}
}
