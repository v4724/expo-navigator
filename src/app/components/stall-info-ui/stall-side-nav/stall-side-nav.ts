import { CommonModule } from '@angular/common';
import {
  AfterViewInit,
  Component,
  computed,
  inject,
  input,
  OnInit,
  output,
  signal,
  WritableSignal,
} from '@angular/core';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { combineLatest, distinctUntilChanged, finalize, first } from 'rxjs';
import { LightboxService } from 'src/app/core/services/state/lightbox-service';
import { SelectStallService } from 'src/app/core/services/state/select-stall-service';
import { StallService } from 'src/app/core/services/state/stall-service';
import { StallData } from '../../../core/interfaces/stall.interface';
import { MarkedStallService } from 'src/app/core/services/state/marked-stall-service';
import { MatIcon } from '@angular/material/icon';
import { UserService } from 'src/app/core/services/state/user-service';
import { TabsModule } from 'primeng/tabs';
import { AvatarModule } from 'primeng/avatar';
import { TagService } from 'src/app/core/services/state/tag-service';
import { StallSeriesDto, StallTagDto } from 'src/app/core/models/stall-series-tag.model';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { SafeHtmlPipe } from '../../../shared/pipe/safe-html-pipe';
import { PopoverModule } from 'primeng/popover';
import { ButtonModule } from 'primeng/button';
import { MarkedList } from 'src/app/core/interfaces/marked-stall.interface';
import { MarkedListApiService } from 'src/app/core/services/api/marked-list-api.service';
import { Stall } from '../../stall/stall';

@Component({
  selector: 'app-stall-side-nav',
  imports: [
    CommonModule,
    MatIcon,
    TabsModule,
    AvatarModule,
    SafeHtmlPipe,
    PopoverModule,
    ButtonModule,
  ],
  templateUrl: './stall-side-nav.html',
  styleUrl: './stall-side-nav.scss',
})
export class StallSideNav implements OnInit, AfterViewInit {
  isPreview = input();
  previewStall = input<StallData>();
  previewStall$ = toObservable(this.previewStall);

  open = output<boolean>();
  close = output<boolean>();

  Array = Array;

  private _lightboxService = inject(LightboxService);
  private _stallService = inject(StallService);
  private _selectStallService = inject(SelectStallService);
  private _markedListService = inject(MarkedStallService);
  private _markedListApiService = inject(MarkedListApiService);
  private _userService = inject(UserService);
  private _tagService = inject(TagService);

  stall: WritableSignal<StallData | undefined> = signal<StallData | undefined>(undefined);
  imageLoaded: WritableSignal<boolean> = signal<boolean>(false);
  allMarkedList = toSignal(this._markedListService.markedList$);
  markedMapByStallId = toSignal(this._markedListService.markedMapByStallId$);
  isMarkedFetchEnd = toSignal(this._markedListService.fetchEnd$);

  stall$ = toObservable(this.stall);
  isMarkedSignal = signal(false);
  isLogin = toSignal(this._userService.isLogin$);
  user = toSignal(this._userService.user$);
  stallUpdatedAt = toSignal(this._stallService.stallUpdatedAt$);

  isEditable = computed(() => {
    const isLogin = this.isLogin();
    const user = this.user();
    if (isLogin && user) {
      return user.stallIds.find((id) => id === this.stall()?.id);
    }
    return false;
  });

  promoViewTagMap = computed(() => {
    const map = new Map<number, Map<StallSeriesDto, Set<StallTagDto>>>();
    const stall = this.stall();
    if (!stall) {
      return map;
    }

    // 編輯攤位時，一併更新前端資料
    const stallUpdatedAt = this.stallUpdatedAt();
    if (stallUpdatedAt) {
      console.debug('stallUpdatedAt', stallUpdatedAt);
    }

    stall.promoData.forEach((promo) => {
      if (!promo.id) {
        return;
      }

      const tagMap = new Map<StallSeriesDto, Set<StallTagDto>>();

      promo.series.forEach((seriesId: number) => {
        const series = this._tagService.getSeriesById(seriesId);
        if (!series) return;
        tagMap.set(series, new Set());
      });
      promo.tags.forEach((subTagId: number) => {
        const subTag = this._tagService.getTagById(subTagId);
        if (!subTag) return;

        const series = this._tagService.getSeriesById(subTag.seriesId);
        if (!series) return;

        let seriesEntry = tagMap.get(series);
        if (!seriesEntry) {
          tagMap.set(series, new Set([subTag]));
        } else {
          seriesEntry.add(subTag);
        }
      });
      map.set(promo.id, tagMap);
    });
    return map;
  });

  stallId = computed(() => {
    return this.stall()?.id ?? '';
  });

  defaultAvatar: string = 'https://images.plurk.com/3rbw6tg1lA5dEGpdKTL8j1.png';

  ngOnInit() {
    if (this.isPreview()) {
      this.previewStall$.subscribe((stall) => {
        if (stall) {
          this.stall.set(stall);
        }
      });
    }

    this._selectStallService.selectedStallId$.pipe(distinctUntilChanged()).subscribe((stallId) => {
      console.debug('stall modal select stall: ', stallId);
      this.isMarkedSignal.set(false);
      this.imageLoaded.set(false);
      requestAnimationFrame(() => {
        this.stall.set(this._selectStallService.selectedStall);
        if (stallId) {
          this.open.emit(true);
          this.initEmbedsContent();
        }
      });
    });

    // 切換 stall 時更新 marked 狀態
    combineLatest([this.stall$, this._markedListService.fetchEnd$.pipe(first((val) => !!val))])
      .pipe()
      .subscribe(([stall]) => {
        let isMarked = false;
        if (stall) {
          const stallId = stall.id;
          isMarked = this._markedListService.isMarked(stallId);
        }
        this.isMarkedSignal.set(isMarked);
      });
  }

  ngAfterViewInit(): void {}

  /**
   * Populates and opens the modal for a specific stall.
   */
  initEmbedsContent() {
    // 動態嵌入 IG 貼文
    if (window.instgrm) {
      window.instgrm.Embeds.process();
    }

    // 動態嵌入 twitter 貼文
    if (window.twttr) {
      window.twttr?.widgets?.load(
        document.getElementsByClassName('modal-wrapper')[0] as HTMLElement,
      );
    }
  }

  /**
   * Hides the modal and clears any selection.
   * @param context An object containing all necessary dependencies.
   */
  closeModal() {
    if (!this.isPreview()) {
      this._selectStallService.clearSelection();
    }
    this.close.emit(true);
  }

  // --- Image Lightbox Listeners ---
  bodyClicked(e: Event) {
    const target = e.target;
    // Check if the clicked element is an image within the designated areas.
    if (target instanceof HTMLImageElement) {
      let src = '';
      const parentElement = target.parentElement;
      if (target.classList.contains('official-stall-image')) {
        src = target.src;
      } else if (
        target.closest('.promo-html-content') &&
        parentElement instanceof HTMLAnchorElement
      ) {
        // 特殊情況：圖片外層用超連結(？)
        const regex = RegExp(/https?:\/\/.*\.(jpg|jpeg|png|gif|webp)(\?.*)?$/);
        const isImageHref = regex.test(parentElement?.href ?? '');
        if (isImageHref) {
          src = target.alt;

          e.stopPropagation();
          e.preventDefault();
        }
      } else {
        src = target.src;
      }

      this._lightboxService.openImageLightbox(src, target.alt);
    }
  }

  // 開啟外部連結
  oenpLink() {
    window.open(this.stall()?.stallLink, '_target');
  }

  removeFromMarkedList(data: MarkedList) {
    const dto = this._markedListApiService.transformToDto(data);

    const index = dto.list.indexOf(this.stallId());
    dto.list.splice(index, 1);

    data.isUpdating = true;
    this._markedListApiService
      .update(data.id, dto)
      .pipe(
        finalize(() => {
          data.isUpdating = false;
        }),
      )
      .subscribe((res) => {
        if (res.success) {
          this._markedListService.update(dto);
        }
      });
  }

  addToMarkedList(data: MarkedList) {
    const dto = this._markedListApiService.transformToDto(data);

    dto.list.push(this.stallId());

    data.isUpdating = true;
    this._markedListApiService
      .update(data.id, dto)
      .pipe(
        finalize(() => {
          data.isUpdating = false;
        }),
      )
      .subscribe((res) => {
        if (res.success) {
          this._markedListService.update(dto);
        }
      });
  }
}
