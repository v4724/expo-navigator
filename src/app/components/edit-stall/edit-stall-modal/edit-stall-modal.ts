import {
  ChangeDetectorRef,
  Component,
  inject,
  OnDestroy,
  OnInit,
  signal,
  ViewChild,
} from '@angular/core';
import {
  FormArray,
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import {
  MatDialogRef,
  MatDialog,
  MatDialogActions,
  MatDialogContent,
} from '@angular/material/dialog';
import { ConfirmDialog } from 'src/app/shared/components/confirm-dialog/confirm-dialog';
import { InputTextModule } from 'primeng/inputtext';
import { MatIcon } from '@angular/material/icon';
import { SelectStallService } from 'src/app/core/services/state/select-stall-service';
import { StallData } from '../../stall/stall.interface';
import { MessageModule } from 'primeng/message';
import { EditorModule } from 'primeng/editor';
import { FloatLabel } from 'primeng/floatlabel';
import { FieldsetModule } from 'primeng/fieldset';
import { Tabs, TabsModule } from 'primeng/tabs';
import { AvatarModule } from 'primeng/avatar';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { DividerModule } from 'primeng/divider';
import { TagService } from 'src/app/core/services/state/tag-service';
import { first } from 'rxjs';
import { StallSeriesDto, StallTagDto } from 'src/app/core/models/stall-series-tag.model';
import { Checkbox, CheckboxModule } from 'primeng/checkbox';
import { PanelModule } from 'primeng/panel';

interface MyTab {
  icon: string;
  name: string;
}

interface StallTag extends StallTagDto {
  checked: boolean;
}

@Component({
  selector: 'app-edit-stall-modal',
  imports: [
    ButtonModule,
    CommonModule,
    ReactiveFormsModule,
    InputTextModule,
    MatButtonModule,
    MatDialogContent,
    MatDialogActions,
    MatIcon,
    MessageModule,
    EditorModule,
    FloatLabel,
    FieldsetModule,
    TabsModule,
    AvatarModule,
    DividerModule,
    FormsModule,
    CheckboxModule,
    Checkbox,
    PanelModule,
  ],
  templateUrl: './edit-stall-modal.html',
  styleUrl: './edit-stall-modal.scss',
})
export class EditStallModal implements OnInit, OnDestroy {
  @ViewChild(Tabs) promoTabs!: Tabs;

  readonly dialogRef = inject(MatDialogRef<EditStallModal>);

  private readonly _selectStallService = inject(SelectStallService);
  private readonly _dialog = inject(MatDialog);
  private readonly _fb = inject(FormBuilder);
  private readonly _tagService = inject(TagService);
  private readonly _cdr = inject(ChangeDetectorRef);

  tabList = signal<MyTab[]>([]);

  stallForm: FormGroup;

  seriesAndTags = signal<Map<StallSeriesDto, Map<'CHAR' | 'CP', StallTag[]>>>(new Map());

  constructor() {
    this.stallForm = this._fb.group({
      stallId: [''],
      stallTitle: [''],
      stallImg: [''],
      stallLink: [''],
      promos: this._fb.array([]),
    });
  }

  get promos(): FormArray {
    return this.stallForm.get('promos') as FormArray;
  }

  ngOnInit(): void {
    const stall = this._selectStallService.selectedStall;
    if (stall) {
      this.initFormVal(stall);
      this.updateTabList();
    }

    this.promos.valueChanges.subscribe((result) => {
      this.updateTabList();
    });

    this._tagService.fetchEnd$.pipe(first((val) => !!val)).subscribe(() => {
      const series = Array.from(this._tagService.allSeries.values());
      const tags = Array.from(this._tagService.allTags.values());
      const map = new Map();
      series.forEach((item) => {
        const charTags = tags.filter(
          (tag) => tag.seriesId === item.seriesId && tag.tagType === 'CHAR',
        );
        const cpTags = tags.filter((tag) => tag.seriesId === item.seriesId && tag.tagType === 'CP');
        const typeMap = new Map();
        typeMap.set('CHAR', charTags);
        typeMap.set('CP', cpTags);
        map.set(item, typeMap);
      });

      this.seriesAndTags.set(map);
    });
  }

  ngOnDestroy(): void {}

  initFormVal(stall: StallData) {
    this.stallForm.patchValue({
      stallId: stall.id,
      stallTitle: stall.stallTitle,
      stallImg: stall.stallImg,
      stallLink: stall.stallLink,
    });
    stall.promoData.forEach((item) => {
      const promo = this.createPromo();
      const promoLink = promo.get('links');
      promo.patchValue({
        name: item.promoUser,
        icon: item.promoAvatar,
        html: item.promoHTML,
        seriesAndTags: '',
      });
      item.promoLinks.forEach((link) => {
        const linkForm = this.createLink();
        linkForm.patchValue({
          href: link.href,
          text: link.text,
        });

        if (promoLink) (promoLink as FormArray).push(linkForm);
      });
      this.promos.push(promo);
    });
  }

  getLinks(promoIndex: number): FormArray {
    return this.promos.at(promoIndex).get('links') as FormArray;
  }

  addPromo() {
    this.promos.push(this.createPromo());
  }

  addLink(e: Event, promoIndex: number) {
    this.getLinks(promoIndex).push(this.createLink());
  }

  createPromo() {
    return this._fb.group({
      name: [''],
      icon: [''],
      links: this._fb.array([]),
      html: [''],
      seriesAndTags: [''],
    });
  }

  createLink() {
    return this._fb.group({
      href: ['', Validators.required],
      text: ['連結', Validators.required],
    });
  }

  // 移除 宣傳車
  removePromo(e: Event, index: number) {
    e.stopPropagation();
    e.preventDefault();
    this.promos.removeAt(index);
  }

  // 移除連結
  removeLink(promoIndex: number, linkIndex: number) {
    this.getLinks(promoIndex).removeAt(linkIndex);
  }

  updateTabList() {
    const tabList: MyTab[] = [];
    this.promos.controls.forEach((promo) => {
      const icon = promo.get('icon')?.value;
      const name = promo.get('name')?.value;
      tabList.push({ icon, name });
    });
    this.tabList.set(tabList);
  }

  onTempSave() {
    this.stallForm.markAllAsDirty();
    this.stallForm.updateValueAndValidity();
    if (this.stallForm.invalid) {
      return;
    }
    console.log(this.stallForm.getRawValue());
    console.log('暫存編輯');
  }

  onSave() {
    this.stallForm.markAllAsDirty();
    this.stallForm.updateValueAndValidity();
    if (this.stallForm.invalid) {
      return;
    }
    console.log(this.stallForm.getRawValue());
    console.log('儲存編輯');

    this.dialogRef.close();
  }

  onClose() {
    if (this.stallForm.dirty) {
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
}
