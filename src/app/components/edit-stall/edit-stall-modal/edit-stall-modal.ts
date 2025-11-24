import {
  AfterViewInit,
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
import { StallData } from '../../../core/interfaces/stall.interface';
import { MessageModule } from 'primeng/message';
import { FloatLabel } from 'primeng/floatlabel';
import { FieldsetModule } from 'primeng/fieldset';
import { Tabs, TabsModule } from 'primeng/tabs';
import { AvatarModule } from 'primeng/avatar';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { DividerModule } from 'primeng/divider';
import { TagService } from 'src/app/core/services/state/tag-service';
import { finalize, first, map, of } from 'rxjs';
import { StallSeriesDto, StallTagDto } from 'src/app/core/models/stall-series-tag.model';
import { Checkbox, CheckboxModule } from 'primeng/checkbox';
import { PanelModule } from 'primeng/panel';
import { Popover } from 'primeng/popover';
import { PopoverModule } from 'primeng/popover';
import { BadgeModule } from 'primeng/badge';
import { PromoStall } from 'src/app/core/interfaces/promo-stall.interface';
import { PromoApiService } from 'src/app/core/services/api/promo-api.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ResponseSnackBar } from 'src/app/shared/components/response-snack-bar/response-snack-bar';
import { StallService } from 'src/app/core/services/state/stall-service';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
// import { StallSideNav } from '../../stall-info-ui/stall-side-nav/stall-side-nav';
import { UiStateService } from 'src/app/core/services/state/ui-state-service';

import { CKEditorModule } from '@ckeditor/ckeditor5-angular';
import { EditorConfig } from 'ckeditor5';
import translations from 'ckeditor5/translations/zh.js';
import { StallApiService } from 'src/app/core/services/api/stall-api.service';
import { UpdateStallDto, UpdateStallDtoWithPromo } from 'src/app/core/models/stall.model';
import { toSignal } from '@angular/core/rxjs-interop';
import { isEqual } from 'lodash-es';
import { PromoStallDto, UpdatePromoStallDto } from 'src/app/core/models/promo-stall.model';
import { Dialog } from 'primeng/dialog';
import { StallSideContent } from '../../stall-info-ui/stall-side-nav/stall-side-content/stall-side-content';
import { StallSideHeader } from '../../stall-info-ui/stall-side-nav/stall-side-header/stall-side-header';
import { StallInfoDrawer } from 'src/app/device/mobile/components/stall-info-drawer/stall-info-drawer';

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
    Dialog,
    MatIcon,
    MessageModule,
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
    MatProgressSpinnerModule,
    CKEditorModule,
    // StallSideNav,
    StallSideHeader,
    StallSideContent,
    StallInfoDrawer,
  ],
  templateUrl: './edit-stall-modal.html',
  styleUrl: './edit-stall-modal.scss',
})
export class EditStallModal implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild(Tabs) promoTabs!: Tabs;

  private readonly _stallService = inject(StallService);
  private readonly _selectStallService = inject(SelectStallService);
  private readonly _dialog = inject(MatDialog);
  private readonly _fb = inject(FormBuilder);
  private readonly _tagService = inject(TagService);
  private readonly _promoApiService = inject(PromoApiService);
  private readonly _stallApiService = inject(StallApiService);
  private readonly _snackBar = inject(MatSnackBar);
  private readonly _uiStateService = inject(UiStateService);
  private readonly _cdr = inject(ChangeDetectorRef);

  visible = false;
  previewVisible = false;
  previewStall = undefined;

  stallForm: FormGroup;

  selectedStallId = toSignal(this._selectStallService.selectedStallId$);

  tabList = signal<MyTab[]>([]);

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

  isTempSaving = signal<boolean>(false);
  isSaving = signal<boolean>(false);

  // cdkeditor
  afterEditorInit = signal<boolean>(false);
  Editor: any = null;
  config: EditorConfig = {}; // CKEditor needs the DOM tree before calculating the configuration.

  constructor() {
    this.stallForm = this._fb.group({
      stallId: [''],
      stallTitle: [''],
      stallImg: [''],
      stallLink: [''],
      promos: this._fb.array([]),
    });
  }

  get isMobile() {
    return this._uiStateService.isMobile();
  }

  get stallId() {
    return this.stallForm.get('stallId')?.getRawValue() as string;
  }

  get promos(): FormArray {
    return this.stallForm.get('promos') as FormArray;
  }

  ngOnInit(): void {
    // 動態載入 cdkeditor
    if (this._uiStateService.isPlatformBrowser()) {
      // 使用動態匯入，確保只在瀏覽器端載入 CKEditor
      import('ckeditor5')
        .then((module) => {
          this.Editor = module.ClassicEditor;
          const {
            Paragraph,
            Bold,
            Italic,
            Font,
            Alignment,
            Autoformat,
            AutoImage, //	允許直接從 URL 貼上圖片。
            BlockQuote, //建立引言區塊。	'blockQuote'
            Emoji, //允許插入表情符號。	'emoji'
            ImageBlock,
            ImageCaption,
            ImageInline,
            ImageInsertViaUrl,
            ImageResize,
            ImageStyle,
            ImageToolbar,
            Link,
            LinkImage,
            List,
            ListProperties,
            MediaEmbed,
            Mention,
            TextTransformation,
            TodoList,
            Underline,
            SourceEditing,
            GeneralHtmlSupport,
          } = module;
          this.config = {
            licenseKey: 'GPL', // Or 'GPL'.
            plugins: [
              Paragraph,
              Bold,
              Italic,
              Font,
              Alignment,
              Autoformat,
              AutoImage,
              BlockQuote,
              Emoji,
              ImageBlock,
              ImageCaption,
              ImageInline,
              ImageInsertViaUrl,
              ImageResize,
              ImageStyle,
              ImageToolbar, //點選圖片時彈出的工具列。	'imageTextAlternative', 'toggleImageCaption', 'imageStyle:inline', 'imageStyle:block', 'imageStyle:side'
              Italic,
              Link,
              LinkImage,
              List,
              ListProperties,
              MediaEmbed,
              Mention, // "requiredBy":"EmojiMention"
              Paragraph,
              TextTransformation,
              TodoList,
              Underline,
              SourceEditing, // 原始碼
              GeneralHtmlSupport,
            ],
            toolbar: [
              'SourceEditing',
              '|',
              'fontfamily',
              'fontSize',
              'fontColor',
              'fontBackgroundColor',
              '|',
              'bold',
              'italic',
              'underline',
              '|',
              'alignment',
              'bulletedList',
              'numberedList',
              'todoList',
              'blockQuote',
              '|',
              'emoji',
              'link',
              'insertImageViaUrl',
              'mediaEmbed',
            ],
            htmlSupport: {
              allow: [
                {
                  name: /.*/,
                  attributes: true,
                  classes: true,
                  styles: true,
                },
              ],
            },
            image: {
              toolbar: [
                'imageStyle:inline',
                'imageStyle:block',
                'imageStyle:side',
                '|',
                'toggleImageCaption',
              ],
            },
            language: 'zh',
            translations: [translations],
          };
          this.afterEditorInit.set(true);
        })
        .catch((err) => {
          console.error('Failed to load CKEditor:', err);
        });
    }

    this.promos.valueChanges.subscribe((result) => {
      this.updateTabList();
      this.updateSeriesSeletedTagCnt();
      this.updateSeriesCheck();
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
    });
  }

  ngAfterViewInit(): void {}

  ngOnDestroy(): void {}

  initFormVal(stall: StallData) {
    this.stallForm.patchValue({
      stallId: stall.id,
      stallTitle: stall.stallTitle,
      stallImg: stall.stallImg,
      stallLink: stall.stallLink,
    });
    this.promos.clear();

    stall.promoData.forEach((promo: PromoStall) => {
      const promoGroup = this._createPromoGroup();
      const promoLink = promoGroup.get('links');
      const seriesAndTags = promoGroup.get('seriesAndTags');

      // 基本欄位
      promoGroup.patchValue({
        id: promo.id?.toString(),
        stallId: promo.stallId,
        name: promo.promoTitle,
        icon: promo.promoAvatar,
        html: promo.promoHtml,
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
      promo.series.forEach((seriesId: number) => {
        const obj = seriesArr.find((o) => o.seriesId === seriesId);
        if (obj) {
          seriesAndTagsVal[obj.controlName] = true;
        }
      });
      promo.tags.forEach((tagId: number) => {
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

  updateSeriesCheck() {
    const currPromoIndex = Number(this.promoTabs?.value());
    if (Number.isInteger(currPromoIndex)) {
      Object.keys(this.seriesSeletedTagCnt()[currPromoIndex] ?? []).forEach(
        (controlName: string) => {
          const cnt = this.seriesSeletedTagCnt()[currPromoIndex][controlName];
          const control = this.promos.at(currPromoIndex).get('seriesAndTags')?.get(controlName);

          if (cnt > 0) {
            control?.patchValue(true, { emitEvent: false });
          }
        },
      );
    }
  }

  @ViewChild(StallInfoDrawer) mobilePreviewDrawer!: StallInfoDrawer;
  // TODO ckeditor 和 預覽的稍微不一樣，待檢查樣式
  preview() {
    const stall = JSON.parse(JSON.stringify(this._selectStallService.selectedStall));
    const { stallTitle, stallImg, stallLink } = this._getStallFromForm();
    const promos = this._getPromoFromForm();
    stall.stallTitle = stallTitle;
    stall.stallImg = stallImg;
    stall.stallLink = stallLink;
    stall.promoData = promos;

    if (this.isMobile) {
      this.mobilePreviewDrawer?.show();
    } else {
      this.previewVisible = true;
    }
    this.previewStall = stall;
  }

  show() {
    this.visible = true;

    // 取得標籤列表後再初始化資料
    const stall = this._selectStallService.selectedStall;
    if (stall) {
      console.debug('edit stall', stall);
      this.initFormVal(stall);
      this.updateTabList();
      this.updateSeriesSeletedTagCnt();
      this.updateSeriesCheck();
    }
  }

  onTempSave() {
    this.stallForm.markAllAsDirty();
    this.stallForm.updateValueAndValidity();
    console.debug(this.stallForm, this.stallForm.invalid);
    if (this.stallForm.invalid) {
      return;
    }

    this.isTempSaving.set(true);
    this._update()
      .pipe(
        finalize(() => {
          this.isTempSaving.set(false);
        }),
      )
      .subscribe((res: any) => {
        if (res.success) {
          this._snackBar.openFromComponent(ResponseSnackBar, {
            duration: 2000,
            data: { message: '暫存成功', isError: false },
          });
        } else {
          this._snackBar.openFromComponent(ResponseSnackBar, {
            duration: 2000,
            data: { message: '暫存失敗', isError: true },
          });
        }
      });
  }

  onSave() {
    this.stallForm.markAllAsDirty();
    this.stallForm.updateValueAndValidity();
    if (this.stallForm.invalid) {
      return;
    }

    const updateObs = this._update();
    if (!updateObs) {
      return;
    }

    this.isSaving.set(true);
    this._update()
      .pipe(
        finalize(() => {
          this.isSaving.set(false);
        }),
      )
      .subscribe((res: any) => {
        if (res.success) {
          this.visible = false;
          this._snackBar.openFromComponent(ResponseSnackBar, {
            duration: 3000,
            data: { message: '儲存成功', isError: false },
          });
        } else {
          this._snackBar.openFromComponent(ResponseSnackBar, {
            duration: 3000,
            data: { message: '儲存失敗', isError: true },
          });
        }
      });
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
          console.debug('結束編輯');
          this.visible = false;
        }
      });
    } else {
      this.visible = false;
    }
  }

  private _createPromoGroup() {
    return this._fb.group({
      id: [''],
      stallId: [this._selectStallService.selectedStall?.id || ''],
      name: ['', Validators.required],
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

  private _update() {
    const stall = this._getStallFromForm();
    const promos = this._getPromoFromForm();

    const isStallEqual = isEqual(this._origStall(), stall);
    const isPromosEqual = isEqual(this._origPromos(), promos);
    console.debug('raw value', this.stallForm.getRawValue());
    console.debug('isStallEqual', isStallEqual, this._origStall(), stall);
    console.debug('isPromosEqual', isPromosEqual, this._origPromos(), promos);
    if (isStallEqual && isPromosEqual) {
      return of();
    }
    const data = { ...stall, promotion: promos } as UpdateStallDtoWithPromo;
    console.debug('暫存/儲存', data);
    return this._stallApiService.updateStallwithPromo(this.stallId, data).pipe(
      map((res) => {
        if (res.success) {
          this._stallService.updateStall(this.stallId, res.data);
          console.info('暫存/儲存成功', res);
        } else {
          console.error('暫存/儲存失敗', res);
        }

        return res;
      }),
    );
  }

  private _getStallFromForm(): UpdateStallDto {
    const { stallId, stallTitle, stallImg, stallLink } = this.stallForm.getRawValue();
    const dto = {
      stallTitle: stallTitle,
      stallImg: stallImg || '',
      stallLink: stallLink || '',
    };

    return dto;
  }

  private _getPromoFromForm(): UpdatePromoStallDto[] {
    const promos = this.promos.getRawValue();
    promos.forEach((promo: any) => {
      // 轉換 series, tags 欄位格式
      const series: number[] = [];
      const tags: number[] = [];
      Object.keys(promo.seriesAndTags).forEach((key) => {
        if (key.startsWith('series-') && promo.seriesAndTags[key]) {
          series.push(Number(key.replace('series-', '')));
        } else if (key.startsWith('tag-') && promo.seriesAndTags[key]) {
          tags.push(Number(key.replace('tag-', '')));
        }
      });
      if (promo.id) {
        promo.id = Number(promo.id);
      } else {
        delete promo.id;
      }
      promo.promoTitle = promo.name.toString();
      promo.promoAvatar = promo.icon;
      promo.promoHtml = promo.html;
      promo.promoLinks = promo.links;
      promo.series = series;
      promo.tags = tags;
      delete promo.name;
      delete promo.icon;
      delete promo.html;
      delete promo.links;
      delete promo.seriesAndTags;
    });

    return promos;
  }

  private _origStall(): UpdateStallDto | null {
    const stall = this._selectStallService.selectedStall;
    if (!stall) return null;

    const { stallTitle, stallImg, stallLink } = stall;
    return {
      stallTitle: stallTitle,
      stallImg: stallImg || '',
      stallLink: stallLink || '',
    };
  }

  private _origPromos(): PromoStallDto[] {
    const stall = this._selectStallService.selectedStall;
    if (!stall) return [];

    return stall.promoData;
  }
}
