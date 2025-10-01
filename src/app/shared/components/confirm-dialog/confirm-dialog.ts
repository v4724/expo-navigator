import { Component, inject, model, OnInit, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import {
  MAT_DIALOG_DATA,
  MatDialogActions,
  MatDialogClose,
  MatDialogContent,
  MatDialogRef,
} from '@angular/material/dialog';

export interface DialogData {
  label: string;
}
@Component({
  selector: 'app-confirm-dialog',
  imports: [MatButtonModule, MatDialogContent, MatDialogActions, MatDialogClose],
  templateUrl: './confirm-dialog.html',
  styleUrl: './confirm-dialog.scss',
})
export class ConfirmDialog implements OnInit {
  readonly dialogRef = inject(MatDialogRef<ConfirmDialog>);
  readonly data = inject<DialogData>(MAT_DIALOG_DATA);

  label = signal<string>('');

  ngOnInit(): void {
    this.label.set(this.data.label);
  }

  onNoClick(): void {
    this.dialogRef.close();
  }

  confirm() {}
}
