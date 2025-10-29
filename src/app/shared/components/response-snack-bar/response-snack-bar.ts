import { Component, inject } from '@angular/core';
import {
  MAT_SNACK_BAR_DATA,
  MatSnackBarAction,
  MatSnackBarActions,
  MatSnackBarLabel,
  MatSnackBarRef,
} from '@angular/material/snack-bar';
import { ButtonModule } from 'primeng/button';

@Component({
  selector: 'app-response-snack-bar',
  imports: [ButtonModule, MatSnackBarLabel, MatSnackBarActions, MatSnackBarAction],
  templateUrl: './response-snack-bar.html',
  styleUrl: './response-snack-bar.scss',
})
export class ResponseSnackBar {
  snackBarRef = inject(MatSnackBarRef);
  data = inject(MAT_SNACK_BAR_DATA);
  message: string = this.data.message;
  isError: boolean = this.data.isError;
}
