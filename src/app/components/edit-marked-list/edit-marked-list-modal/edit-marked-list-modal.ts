import {
  AfterViewInit,
  Component,
  inject,
  OnDestroy,
  OnInit,
  signal,
  ViewChild,
} from '@angular/core';
import { StallFilterInput } from 'src/app/shared/components/stall-filter-input/stall-filter-input';
import {
  FormArray,
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { ConfirmDialog } from 'src/app/shared/components/confirm-dialog/confirm-dialog';
import { finalize, map, of, tap } from 'rxjs';
import { MarkedStallService } from 'src/app/core/services/state/marked-stall-service';
import { MarkedListUpdateDto } from 'src/app/core/models/marked-stall.model';
import { MarkedList } from 'src/app/core/interfaces/marked-stall.interface';
import {
  MAT_DIALOG_DATA,
  MatDialog,
  MatDialogActions,
  MatDialogContent,
  MatDialogRef,
} from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { FloatLabel } from 'primeng/floatlabel';
import { Divider } from 'primeng/divider';
import { StallData } from '../../stall/stall.interface';
import { Chip } from 'primeng/chip';
import { InputTextModule } from 'primeng/inputtext';
import { MarkedListApiService } from 'src/app/core/services/api/marked-list-api.service';
import { ColorPicker, ColorPickerChangeEvent, ColorPickerModule } from 'primeng/colorpicker';
import { CommonModule } from '@angular/common';

interface DialogData {
  list: MarkedList;
}

@Component({
  selector: 'app-edit-marked-list-modal',
  imports: [
    StallFilterInput,
    FormsModule,
    ReactiveFormsModule,
    MatDialogContent,
    MatDialogActions,
    FloatLabel,
    Divider,
    Chip,
    InputTextModule,
    ColorPickerModule,
    CommonModule,
  ],
  templateUrl: './edit-marked-list-modal.html',
  styleUrl: './edit-marked-list-modal.scss',
})
export class EditMarkedListModal implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('colorPicker') colorPicker!: ColorPicker;

  readonly dialogRef = inject(MatDialogRef<EditMarkedListModal>);
  readonly data = inject<DialogData>(MAT_DIALOG_DATA);

  private readonly _markedListService = inject(MarkedStallService);
  private readonly _markedListApiService = inject(MarkedListApiService);
  private readonly _dialog = inject(MatDialog);
  private readonly _fb = inject(FormBuilder);
  private readonly _snackBar = inject(MatSnackBar);

  editForm: FormGroup;

  isTempSaving = signal<boolean>(false);
  isSaving = signal<boolean>(false);

  defaultColor = '#6e11b0';
  presetColorsList: string[] = [
    this.defaultColor,
    '#ff0000',
    '#00ff00',
    '#0000ff',
    '#ffff00',
    '#ff00ff',
  ];

  constructor() {
    this.editForm = this._fb.group({
      id: [''],
      listName: ['', Validators.required],
      icon: [''],
      iconColor: [''],
      colorPickerVal: ['#000000'],
      isDefaultColor: [true],
      stallId: [''],
      list: this._fb.array([]),
    });
  }

  get id() {
    return this.editForm.get('id')?.getRawValue() as number;
  }

  get iconColor(): string {
    return this.editForm.get('iconColor')?.getRawValue() ?? '';
  }

  get colorPickerVal(): string {
    return this.editForm.get('colorPickerVal')?.getRawValue() ?? '';
  }

  get isDefaultColor(): boolean {
    return this.editForm.get('isDefaultColor')?.getRawValue();
  }

  get list(): FormArray {
    return this.editForm.get('list') as FormArray;
  }

  get selectedStalls(): StallData[] {
    return this.list.value ?? [];
  }
  ngOnInit(): void {
    this.initFormVal(this.data.list);
  }

  ngAfterViewInit(): void {}

  ngOnDestroy(): void {}

  initFormVal(item: MarkedList) {
    this.editForm.patchValue({
      id: item.id,
      listName: item.listName,
      icon: item.icon,
      iconColor: item.iconColor || this.defaultColor,
      colorPickerVal: item.isDefaultColor ? '#000000' : item.iconColor,
      isDefaultColor: item.isDefaultColor,
    });

    item.list.forEach((item) => {
      this.list.push(this._fb.control(item));
    });
  }

  clickDefaultColor(color: string) {
    this.editForm.get('iconColor')?.setValue(color);
    this.editForm.get('isDefaultColor')?.setValue(true);

    this.colorPicker?.hide();
  }

  clickCustomizeColor() {
    this.editForm.get('iconColor')?.setValue(this.colorPickerVal);
    this.editForm.get('isDefaultColor')?.setValue(false);
  }

  onColorPickerChange(e: ColorPickerChangeEvent) {
    if (typeof e.value === 'string') {
      this.editForm.get('iconColor')?.setValue(e.value);
    }
  }

  onFilterSelect(stall: StallData) {
    const list = this.list.value;
    if (list.includes(stall)) {
      return;
    }
    this.list.push(this._fb.control(stall));
  }

  remove(index: number) {
    this.list.removeAt(index);
  }

  onSave() {
    this.editForm.markAllAsDirty();
    this.editForm.updateValueAndValidity();
    if (this.editForm.invalid) {
      return;
    }

    const updateObs = this._update();
    if (!updateObs) {
      return;
    }

    this.isSaving.set(true);
    updateObs
      .pipe(
        finalize(() => {
          this.isSaving.set(false);
        }),
      )
      .subscribe((res) => {
        if (res.success) {
          this.dialogRef.close();
          this._snackBar.open('儲存成功', '', { duration: 2000 });
        } else {
          this._snackBar.open(`儲存失敗 ${res.errors[0]}`, '', { duration: 2000 });
        }
      });
  }

  // TODO 資料比對
  onClose() {
    if (this.editForm.dirty) {
      const dialogRef = this._dialog.open(ConfirmDialog, {
        disableClose: true, // 取消點選背景自動關閉
        data: {
          label: '資料尚未儲存，是否結束編輯？',
        },
      });

      dialogRef.afterClosed().subscribe((result) => {
        console.debug('The dialog was closed');
        if (result === 'CONFIRM') {
          console.log('結束編輯');
          this.dialogRef.close();
        }
      });
    } else {
      this.dialogRef.close();
    }
  }

  // TODO
  private _update() {
    const data = this._getDataFromForm();
    const id = this.id;
    console.debug('儲存', data);

    const observable = this._markedListApiService.update(id, data).pipe(
      tap((res) => {
        if (res.success) {
          this._markedListService.update(data);
        }
      }),
    );

    return observable;
  }

  private _getDataFromForm(): MarkedListUpdateDto {
    const rawValue = this.editForm.getRawValue();

    rawValue.list = rawValue.list.map((stall: StallData) => stall.id);
    delete rawValue.stallId;
    delete rawValue.colorPickerVal;

    return rawValue as MarkedListUpdateDto;
  }
}
