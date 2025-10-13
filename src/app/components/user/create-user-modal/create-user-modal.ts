import { DialogModule } from '@angular/cdk/dialog';
import { Component, computed, ElementRef, inject, signal, ViewChild } from '@angular/core';
import {
  FormArray,
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
} from '@angular/forms';
import { Validators } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { ChipModule } from 'primeng/chip';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { FloatLabel } from 'primeng/floatlabel';
import { CommonModule } from '@angular/common';
import { StallService } from 'src/app/core/services/state/stall-service';
import { MatButton } from '@angular/material/button';
import { CheckboxModule } from 'primeng/checkbox';
import { UserApiService } from 'src/app/core/services/api/user-api.service';
import { catchError, EMPTY, finalize } from 'rxjs';

@Component({
  selector: 'app-create-user-modal',
  imports: [
    ButtonModule,
    CheckboxModule,
    MatButton,
    ChipModule,
    CommonModule,
    DialogModule,
    FormsModule,
    FloatLabel,
    InputTextModule,
    MatDialogModule,
    ReactiveFormsModule,
  ],
  templateUrl: './create-user-modal.html',
  styleUrl: './create-user-modal.scss',
})
export class CreateUserModal {
  popupStyle: { left: string; top: string; width: string } = {
    left: '0px',
    top: '0px',
    width: '200px',
  };
  @ViewChild('stallIdInput', { static: false }) stallIdInput!: ElementRef<HTMLInputElement>;

  readonly dialogRef = inject(MatDialogRef<CreateUserModal>);

  private readonly _fb = inject(FormBuilder);
  private readonly _snackBar = inject(MatSnackBar);
  private readonly _service = inject(StallService);

  isCreating = signal<boolean>(false);

  userForm: FormGroup;
  filteredStallIds: string[] = [];

  constructor() {
    this.userForm = this._fb.group({
      acc: ['', Validators.required],
      stallId: [''],
      isStallOwner: [false],
      stallIds: this._fb.array([]),
    });

    // 監聽 stallId 欄位變化
    this.userForm.get('stallId')!.valueChanges.subscribe((value: string) => {
      this.filterStallIds(value);
    });
  }

  filterStallIds(input: string) {
    const keyword = (input || '').toLowerCase();
    this.filteredStallIds = Array.from(this._service.allStallIds).filter(
      (id) => id.toLowerCase().includes(keyword) && !this.selectedStallIds().includes(id),
    );
    this.updatePopupPosition();
  }

  updatePopupPosition() {
    if (this.stallIdInput) {
      const rect = this.stallIdInput.nativeElement.getBoundingClientRect();
      this.popupStyle = {
        left: rect.left + window.scrollX + 'px',
        top: rect.bottom + window.scrollY + 'px',
        width: rect.width + 'px',
      };
    }
  }

  selectedStallIds(): string[] {
    return this.userForm.get('stallIds')?.value ?? [];
  }

  addStallId(stallId?: string) {
    const input = stallId || this.userForm.get('stallId')?.value?.trim();
    if (!input) return;
    const validStallIds = this._service.allStallIds;
    const selected = this.selectedStallIds();

    if (!validStallIds.has(input)) {
      this._snackBar.open('此攤位代號不存在', '', { duration: 2000 });
      return;
    }
    if (selected.includes(input)) {
      this._snackBar.open('此攤位代號已設定', '', { duration: 2000 });
      return;
    }
    (this.userForm.get('stallIds') as FormArray).push(this._fb.control(input));
    this.userForm.get('stallId')?.setValue('');
    this.filteredStallIds = [];
  }

  removeStallId(index: number) {
    (this.userForm.get('stallIds') as FormArray).removeAt(index);
  }

  onStallIdKeydown(event: KeyboardEvent) {
    if (event.key === 'Enter') {
      event.preventDefault();
      this.addStallId();
    }
  }

  private _userApiService = inject(UserApiService);
  onCreate() {
    this.userForm.markAllAsDirty();
    this.userForm.updateValueAndValidity();

    if (this.userForm.valid) {
      this.isCreating.set(true);

      console.log('Creating user:', this.userForm.getRawValue());
      const body = this.userForm.getRawValue();
      delete body.stallId;

      this._userApiService
        .create(body)
        .pipe(
          catchError((err) => {
            this._snackBar.open('使用者建立失敗', '伺服器錯誤', { duration: 2000 });
            console.error(err);
            return EMPTY;
          }),
          finalize(() => {
            this.isCreating.set(false);
          }),
        )
        .subscribe((res) => {
          if (res.success) {
            this._snackBar.open('使用者建立成功', '', { duration: 2000 });
            this.dialogRef.close();
          } else {
            this._snackBar.open('使用者建立失敗', res.errors[0], { duration: 2000 });
            console.error('Create user failed:', res);
          }
        });
    }
  }

  onClose() {
    this.dialogRef.close();
  }
}
