import { Component, inject, model, OnInit, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import {
  MAT_DIALOG_DATA,
  MatDialogActions,
  MatDialogClose,
  MatDialogContent,
  MatDialogRef,
  MatDialogTitle,
} from '@angular/material/dialog';

export interface DialogData {
  title?: string;
  label: string;
}
@Component({
  selector: 'app-confirm-dialog',
  imports: [MatButtonModule, MatDialogTitle, MatDialogContent, MatDialogActions, MatDialogClose],
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
