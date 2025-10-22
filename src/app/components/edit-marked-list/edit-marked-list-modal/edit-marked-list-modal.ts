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
import { StallData } from '../../../core/interfaces/stall.interface';
import { Chip } from 'primeng/chip';
import { InputTextModule } from 'primeng/inputtext';
import { MarkedListApiService } from 'src/app/core/services/api/marked-list-api.service';
import { ColorPicker, ColorPickerModule } from 'primeng/colorpicker';
import { CommonModule } from '@angular/common';
import { MatIcon } from '@angular/material/icon';
import { CheckboxModule } from 'primeng/checkbox';
import { MatTooltip } from '@angular/material/tooltip';
import { MatButtonModule } from '@angular/material/button';

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
    MatIcon,
    CheckboxModule,
    MatTooltip,
    MatButtonModule,
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

  fontIconUrl =
    'https://fonts.google.com/icons?icon.size=24&icon.color=%231f1f1f&icon.set=Material+Icons&icon.style=Filled';
  defaultIcon = 'star';
  presetIconList: string[] = [
    this.defaultIcon,
    'favorite',
    'room',
    'bedtime',
    'cruelty_free',
    'push_pin',
  ];

  constructor() {
    this.editForm = this._fb.group({
      id: [''],
      listName: ['', Validators.required],
      icon: [''],
      iconColor: [''],
      cusIcon: ['auto_awesome'],
      cusIconColor: ['#000000'],
      cusIconColorInput: ['#000000'],
      isCusIcon: [false],
      isCusIconColor: [false],
      stallId: [''],
      list: this._fb.array([]),
    });
  }

  get id() {
    return this.editForm.get('id')?.getRawValue() as number;
  }

  get icon(): string {
    return this.editForm.get('icon')?.getRawValue() ?? '';
  }

  get cusIcon(): string {
    return this.editForm.get('cusIcon')?.getRawValue() ?? '';
  }

  get isCusIcon(): boolean {
    return this.editForm.get('isCusIcon')?.getRawValue();
  }

  get iconColor(): string {
    return this.editForm.get('iconColor')?.getRawValue() ?? '';
  }

  get cusIconColor(): string {
    return this.editForm.get('cusIconColor')?.getRawValue() ?? '';
  }

  get isCusIconColor(): boolean {
    return this.editForm.get('isCusIconColor')?.getRawValue();
  }

  get list(): FormArray {
    return this.editForm.get('list') as FormArray;
  }

  get selectedStalls(): StallData[] {
    return this.list.value ?? [];
  }
  ngOnInit(): void {
    this.initFormVal(this.data.list);
    this.initIconEvent();
    this.initIconColorEvent();
  }

  ngAfterViewInit(): void {}

  ngOnDestroy(): void {}

  initFormVal(item: MarkedList) {
    this.editForm.patchValue({
      id: item.id,
      listName: item.listName,
      icon: item.icon || this.defaultIcon,
      iconColor: item.iconColor || this.defaultColor,
      cusIcon: item.isCusIcon ? item.cusIcon : 'auto_awesome',
      cusIconColor: item.isCusIconColor ? item.iconColor : '#000000',
      cusIconColorInput: item.isCusIconColor ? item.iconColor : '#000000',
      isCusIcon: item.isCusIcon ? item.isCusIcon : false,
      isCusIconColor: item.isCusIconColor,
    });

    item.list.forEach((item) => {
      this.list.push(this._fb.control(item));
    });
  }

  initIconEvent() {
    this.editForm.get('isCusIcon')?.valueChanges.subscribe((val) => {
      if (val) {
        this.editForm.get('icon')?.setValue(this.cusIcon);
      } else {
        this.editForm.get('icon')?.setValue(this.defaultIcon);
      }
    });

    this.editForm.get('cusIcon')?.valueChanges.subscribe((val) => {
      val = val.trim();
      if (this.isCusIcon) {
        this.editForm.get('icon')?.setValue(val);
      }
    });
  }

  initIconColorEvent() {
    this.editForm.get('isCusIconColor')?.valueChanges.subscribe((val) => {
      let color = '';
      if (val) {
        color = this.cusIconColor;
      } else {
        color = this.defaultColor;
      }
      this.editForm.get('iconColor')?.setValue(color);
    });

    this.editForm.get('cusIconColor')?.valueChanges.subscribe((val) => {
      val = val.trim();
      if (this.isCusIconColor) {
        this.editForm.get('iconColor')?.setValue(val);
      }
      this.editForm.get('cusIconColorInput')?.setValue(val, { emitEvent: false });
    });

    this.editForm.get('cusIconColorInput')?.valueChanges.subscribe((val) => {
      val = val.trim();

      if (this.isCusIconColor) {
        this.editForm.get('iconColor')?.setValue(val);
      }
      this.editForm.get('cusIconColor')?.setValue(val, { emitEvent: false });
    });
  }

  clickDefaultIcon(icon: string) {
    this.editForm.get('icon')?.setValue(icon);
    this.editForm.get('isCusIcon')?.setValue(false, { emitEvent: false });
  }

  clickDefaultIconColor(color: string) {
    this.editForm.get('iconColor')?.setValue(color);
    this.editForm.get('isCusIconColor')?.setValue(false, { emitEvent: false });
    this.colorPicker?.hide();
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
          console.debug('結束編輯');
          this.dialogRef.close();
        }
      });
    } else {
      this.dialogRef.close();
    }
  }

  openFontIconRef() {
    window.open(this.fontIconUrl, '_target');
  }

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
    delete rawValue.cusIconColorInput;

    return rawValue as MarkedListUpdateDto;
  }
}
