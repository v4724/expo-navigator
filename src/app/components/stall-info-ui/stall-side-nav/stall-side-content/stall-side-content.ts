import { CommonModule } from '@angular/common';
import {
  Component,
  computed,
  HostListener,
  inject,
  input,
  OnInit,
  signal,
  WritableSignal,
} from '@angular/core';
import { toSignal, toObservable } from '@angular/core/rxjs-interop';
import { AvatarModule } from 'primeng/avatar';
import { TabsModule } from 'primeng/tabs';
import { distinctUntilChanged } from 'rxjs';
import { StallData } from 'src/app/core/interfaces/stall.interface';
import { StallSeriesDto, StallTagDto } from 'src/app/core/models/stall-series-tag.model';
import { LightboxService } from 'src/app/core/services/state/lightbox-service';
import { SelectStallService } from 'src/app/core/services/state/select-stall-service';
import { StallService } from 'src/app/core/services/state/stall-service';
import { TagService } from 'src/app/core/services/state/tag-service';
import { UiStateService } from 'src/app/core/services/state/ui-state-service';
import { UserService } from 'src/app/core/services/state/user-service';
import { SafeHtmlPipe } from 'src/app/shared/pipe/safe-html-pipe';

@Component({
  selector: 'app-stall-side-content',
  imports: [CommonModule, AvatarModule, TabsModule, SafeHtmlPipe],
  templateUrl: './stall-side-content.html',
  styleUrl: './stall-side-content.scss',
})
export class StallSideContent implements OnInit {
  isPreview = input<boolean>(false);
  previewStall = input<StallData>();
  previewStall$ = toObservable(this.previewStall);

  private _selectStallService = inject(SelectStallService);

  private _lightboxService = inject(LightboxService);
  private _stallService = inject(StallService);
  private _userService = inject(UserService);
  private _tagService = inject(TagService);
  private _uiStateService = inject(UiStateService);

  stall: WritableSignal<StallData | undefined> = signal<StallData | undefined>(undefined);
  imageLoaded: WritableSignal<boolean> = signal<boolean>(false);

  isLogin = toSignal(this._userService.isLogin$);
  user = toSignal(this._userService.user$);
  stallUpdatedAt = toSignal(this._stallService.stallUpdatedAt$);

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

        const group = this._tagService.getGroupById(subTag.groupId);
        if (!group) return;

        const series = this._tagService.getSeriesById(group.seriesId);
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

  defaultAvatar: string = 'https://images.plurk.com/3rbw6tg1lA5dEGpdKTL8j1.png';

  stallId = computed(() => {
    return this.stall()?.id ?? '';
  });

  isMobile = false;

  Array = Array;

  ngOnInit(): void {
    this.isMobile = this._uiStateService.isMobile();

    if (this.isPreview()) {
      this.previewStall$.subscribe((stall) => {
        if (stall) {
          this.stall.set(stall);
        }
      });
    } else {
      this._selectStallService.selectedStallId$
        .pipe(distinctUntilChanged())
        .subscribe((stallId) => {
          console.debug('stall modal select stall: ', stallId);
          this.imageLoaded.set(false);
          requestAnimationFrame(() => {
            this.stall.set(this._selectStallService.selectedStall);
            if (stallId) {
              this.initEmbedsContent();
            }
          });
        });
    }
  }

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

  // --- Image Lightbox Listeners ---
  @HostListener('click', ['$event'])
  bodyClicked(e: Event) {
    if (this.isPreview()) {
      e.preventDefault();
      e.stopPropagation();
      return;
    }

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
}
