import {
  ChangeDetectorRef,
  Component,
  computed,
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
import { Popover } from 'primeng/popover';
import { PopoverModule } from 'primeng/popover';
import { BadgeModule } from 'primeng/badge';
import { PromoStall } from 'src/app/core/interfaces/promo-stall.interface';

interface MyTab {
  icon: string;
  name: string;
}
interface StallSeries extends StallSeriesDto {
  controlName: string;
}
interface StallTag extends StallTagDto {
  controlName: string;
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
    PopoverModule,
    BadgeModule,
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

  seriesAndTags = signal<Map<StallSeries, Map<'CHAR' | 'CP', StallTag[]>>>(new Map());

  seriesArr = computed(() => {
    return Array.from(this.seriesAndTags().keys());
  });

  tagsArr = computed(() => {
    let arr: StallTag[] = [];
    this.seriesAndTags().forEach((val) => {
      const char = val.get('CHAR') ?? [];
      const cp = val.get('CP') ?? [];
      arr = arr.concat(char).concat(cp);
    });
    return arr;
  });

  // key (seriesId)
  seriesSeletedTagCnt = signal<{ [key: string]: number }[]>([]);

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
    this.promos.valueChanges.subscribe((result) => {
      this.updateTabList();
      this.updateSeriesSeletedTagCnt();
    });

    this._tagService.fetchEnd$.pipe(first((val) => !!val)).subscribe(() => {
      const series = Array.from(this._tagService.allSeries.values());
      const tags = Array.from(this._tagService.allTags.values());
      const map = new Map();
      series.forEach((item) => {
        const seriesControl = { ...item, controlName: `series-${item.seriesId}` };
        const charTags = tags
          .filter((tag) => tag.seriesId === item.seriesId && tag.tagType === 'CHAR')
          .map((obj) => {
            return { ...obj, controlName: `tag-${obj.tagId}` };
          });
        const cpTags = tags
          .filter((tag) => tag.seriesId === item.seriesId && tag.tagType === 'CP')
          .map((obj) => {
            return { ...obj, controlName: `tag-${obj.tagId}` };
          });
        const typeMap = new Map();
        typeMap.set('CHAR', charTags);
        typeMap.set('CP', cpTags);
        map.set(seriesControl, typeMap);
      });

      this.seriesAndTags.set(map);

      // 取得標籤列表後再初始化資料
      const stall = this._selectStallService.selectedStall;
      if (stall) {
        console.debug('edit stall', stall);
        this.initFormVal(stall);
        this.updateTabList();
        this.updateSeriesSeletedTagCnt();
      }
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

    stall.promoData.forEach((promo: PromoStall) => {
      const promoGroup = this._createPromoGroup();
      const promoLink = promoGroup.get('links');
      const seriesAndTags = promoGroup.get('seriesAndTags');

      // 基本欄位
      promoGroup.patchValue({
        name: promo.promoTitle,
        icon: promo.promoAvatar,
        html: promo.promoHTML,
        customTags: promo.customTags,
      });

      // 連結
      promo.promoLinks.forEach((link) => {
        const linkForm = this._createLinkGroup();
        linkForm.patchValue({
          href: link.href,
          text: link.text,
        });
        if (promoLink) (promoLink as FormArray).push(linkForm);
      });

      // 標籤
      const seriesArr = this.seriesArr();
      const tagsArr = this.tagsArr();
      const seriesAndTagsVal: { [key: string]: boolean } = {};
      promo.series.forEach((seriesId: string) => {
        const obj = seriesArr.find((o) => o.seriesId === seriesId);
        if (obj) {
          seriesAndTagsVal[obj.controlName] = true;
        }
      });
      promo.tags.forEach((tagId: string) => {
        const obj = tagsArr.find((o) => o.tagId === tagId);
        if (obj) {
          seriesAndTagsVal[obj.controlName] = true;
        }
      });
      seriesAndTags?.patchValue(seriesAndTagsVal);

      this.promos.push(promoGroup);
    });
  }

  getLinksForm(promoIndex: number): FormArray {
    return this.promos.at(promoIndex).get('links') as FormArray;
  }

  addPromo() {
    this.promos.push(this._createPromoGroup());
  }

  addLink(e: Event, promoIndex: number) {
    this.getLinksForm(promoIndex).push(this._createLinkGroup());
  }

  // 移除 宣傳車
  removePromo(e: Event, index: number) {
    e.stopPropagation();
    e.preventDefault();
    this.promos.removeAt(index);
  }

  // 移除連結
  removeLink(promoIndex: number, linkIndex: number) {
    this.getLinksForm(promoIndex).removeAt(linkIndex);
  }

  openTags(e: Event, op: Popover, series: StallSeriesDto) {
    op.toggle(e);
  }

  // 更新宣傳車分頁
  updateTabList() {
    const tabList: MyTab[] = [];
    this.promos.controls.forEach((promo) => {
      const icon = promo.get('icon')?.value;
      const name = promo.get('name')?.value;
      tabList.push({ icon, name });
    });
    this.tabList.set(tabList);
  }

  // 更新標籤提示數量
  updateSeriesSeletedTagCnt() {
    const arr: { [key: string]: number }[] = [];
    this.promos.controls.forEach((promo, index) => {
      const promoObj: { [key: string]: number } = {};
      const val = promo.get('seriesAndTags')?.value;
      this.seriesArr().forEach((series) => {
        const seriesControlName = series.controlName;
        val[seriesControlName];
      });
      this.seriesAndTags().forEach((tags, series) => {
        let cnt = 0;
        tags.get('CHAR')?.forEach((tag) => {
          if (val[tag.controlName]) {
            cnt += 1;
          }
        });
        tags.get('CP')?.forEach((tag) => {
          if (val[tag.controlName]) {
            cnt += 1;
          }
        });
        promoObj[series.controlName] = cnt;
      });
      arr.push(promoObj);
    });
    this.seriesSeletedTagCnt.set(arr);
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

  private _createPromoGroup() {
    return this._fb.group({
      name: [''],
      icon: [''],
      links: this._fb.array([]),
      html: [''],
      seriesAndTags: this._createSeriesAndTagsGroup(),
      customTags: [''],
    });
  }

  private _createLinkGroup() {
    return this._fb.group({
      href: ['', Validators.required],
      text: ['連結', Validators.required],
    });
  }

  private _createSeriesAndTagsGroup() {
    const group: Record<string, any[]> = {};
    this.seriesAndTags().forEach((val, series) => {
      group[series.controlName] = [false];
    });

    this.seriesAndTags().forEach((val) => {
      val.get('CHAR')?.forEach((tag) => {
        group[tag.controlName] = [false];
      });
      val.get('CP')?.forEach((tag) => {
        group[tag.controlName] = [false];
      });
    });

    return this._fb.group(group);
  }
}
