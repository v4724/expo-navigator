import { DialogModule } from '@angular/cdk/dialog';
import { Component, ElementRef, inject, input, OnInit, signal, ViewChild } from '@angular/core';
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
import { MatSnackBar } from '@angular/material/snack-bar';
import { FloatLabel } from 'primeng/floatlabel';
import { CommonModule } from '@angular/common';
import { StallService } from 'src/app/core/services/state/stall-service';
import { CheckboxModule } from 'primeng/checkbox';
import { UserApiService } from 'src/app/core/services/api/user-api.service';
import { catchError, EMPTY, finalize } from 'rxjs';
import { UserDto } from 'src/app/core/models/user.model';
import { UserService } from 'src/app/core/services/state/user-service';
import { StallData } from 'src/app/core/interfaces/stall.interface';
import { StallFilterInput } from 'src/app/shared/components/stall-filter-input/stall-filter-input';
import { DynamicDialogRef } from 'primeng/dynamicdialog';

export interface DialogData {
  isEdit: boolean;
}
@Component({
  selector: 'app-create-user-modal',
  imports: [
    ButtonModule,
    CheckboxModule,
    ChipModule,
    CommonModule,
    DialogModule,
    FormsModule,
    FloatLabel,
    InputTextModule,
    ReactiveFormsModule,
    StallFilterInput,
  ],
  templateUrl: './create-user-modal.html',
  styleUrl: './create-user-modal.scss',
})
export class CreateUserModal implements OnInit {
  popupStyle: { left: string; top: string; width: string } = {
    left: '0px',
    top: '0px',
    width: '200px',
  };
  @ViewChild('stallIdInput', { static: false }) stallIdInput!: ElementRef<HTMLInputElement>;

  isEdit = input<boolean>(false);

  private readonly _fb = inject(FormBuilder);
  private readonly _snackBar = inject(MatSnackBar);
  private readonly _service = inject(StallService);
  private readonly _userService = inject(UserService);
  private readonly _userApiService = inject(UserApiService);
  private readonly _ref = inject(DynamicDialogRef);

  isSubmitting = signal<boolean>(false);

  userForm: FormGroup;
  filteredStallIds: string[] = [];

  constructor() {
    this.userForm = this._fb.group({
      id: [''],
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

  ngOnInit() {
    this._userService.user$.pipe().subscribe((user) => {
      if (this.isEdit() && user) {
        const stallIdFormArr = this._fb.array(user.stallIds.map((id) => this._fb.control(id)));
        this.userForm.patchValue({
          id: user.id,
          acc: user.acc,
          isStallOwner: user.isStallOwner,
        });
        this.userForm.setControl('stallIds', stallIdFormArr);
        this.userForm.get('acc')?.disable();
      }
    });
  }

  filterStallIds(input: string) {
    const keyword = (input || '').toLowerCase();
    this.filteredStallIds = Array.from(this._service.allStallIds).filter(
      (id) => id.toLowerCase().includes(keyword) && !this.selectedStallIds.includes(id),
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

  get stallIds(): FormArray {
    return this.userForm.get('stallIds') as FormArray;
  }

  get selectedStallIds(): string[] {
    return this.userForm.get('stallIds')?.value ?? [];
  }

  addStallId(stallId?: string) {
    const input = stallId || this.userForm.get('stallId')?.value?.trim();
    if (!input) return;
    const validStallIds = this._service.allStallIds;
    const selected = this.selectedStallIds;

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

  onFilterSelect(stall: StallData) {
    const list = this.selectedStallIds;
    if (list.includes(stall.id)) {
      return;
    }
    this.stallIds.push(this._fb.control(stall.id));
  }

  onSubmit() {
    this.userForm.markAllAsDirty();
    this.userForm.updateValueAndValidity();

    if (this.userForm.valid) {
      this.isSubmitting.set(true);

      const body = this.userForm.getRawValue();
      const id = body.id;
      delete body.id;
      delete body.stallId;
      if (!body.isStallOwner) {
        body.stallIds = [];
      }
      console.debug('submit user:', body);

      if (this.isEdit()) {
        this._update(id, body);
      } else {
        this._create(body);
      }
    }
  }

  onClose() {
    this._ref.close();
  }

  private _update(id: number, body: UserDto) {
    this._userApiService
      .update(id, body)
      .pipe(
        catchError((err) => {
          this._snackBar.open('使用者更新失敗', '伺服器錯誤', { duration: 2000 });
          console.error(err);
          return EMPTY;
        }),
        finalize(() => {
          this.isSubmitting.set(false);
        }),
      )
      .subscribe((res) => {
        if (res.success) {
          this._snackBar.open('使用者更新成功', '', { duration: 2000 });
          body.id = id;
          this._userService.update(body);
          this._ref.close();
        } else {
          this._snackBar.open('使用者更新失敗', res.errors[0], { duration: 2000 });
          console.error('Update user failed:', res);
        }
      });
  }

  private _create(body: UserDto) {
    this._userApiService
      .create(body)
      .pipe(
        catchError((err) => {
          this._snackBar.open('使用者建立失敗', '伺服器錯誤', { duration: 2000 });
          console.error(err);
          return EMPTY;
        }),
        finalize(() => {
          this.isSubmitting.set(false);
        }),
      )
      .subscribe((res) => {
        if (res.success) {
          this._snackBar.open('使用者建立成功', '', { duration: 2000 });
          this._ref.close();
        } else {
          this._snackBar.open('使用者建立失敗', res.errors[0], { duration: 2000 });
          console.error('Create user failed:', res);
        }
      });
  }
}
