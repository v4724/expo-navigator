import { CommonModule } from '@angular/common';
import { Component, computed, inject, OnInit, output, signal, WritableSignal } from '@angular/core';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { combineLatest, first, map } from 'rxjs';
import { PromoLink } from 'src/app/core/interfaces/promo-link.interface';
import { LightboxService } from 'src/app/core/services/state/lightbox-service';
import { SelectStallService } from 'src/app/core/services/state/select-stall-service';
import { StallModalService } from 'src/app/core/services/state/stall-modal-service';
import { StallService } from 'src/app/core/services/state/stall-service';
import { StallData } from '../../stall/stall.interface';
import { MarkedStallService } from 'src/app/core/services/state/marked-stall-service';
import { MatIcon } from '@angular/material/icon';

@Component({
  selector: 'app-stall-side-nav',
  imports: [CommonModule, MatIcon],
  templateUrl: './stall-side-nav.html',
  styleUrl: './stall-side-nav.scss',
})
export class StallSideNav implements OnInit {
  open = output<boolean>();
  close = output<boolean>();

  service = inject(SelectStallService);

  private _stallModalService = inject(StallModalService);
  private _lightboxService = inject(LightboxService);
  private _stallService = inject(StallService);
  private _selectStallService = inject(SelectStallService);
  private _markedStallService = inject(MarkedStallService);

  show$ = this._stallModalService.showStallModal$;
  stall: WritableSignal<StallData | undefined> = signal<StallData | undefined>(undefined);
  promoLinks: WritableSignal<PromoLink[]> = signal<PromoLink[]>([]);
  imageLoaded: WritableSignal<boolean> = signal<boolean>(false);
  isMarkedFetchEnd = toSignal(this._markedStallService.fetchEnd$);

  stall$ = toObservable(this.stall);
  isMarkedSignal = signal(false);

  hasPromoInfo = computed(() => {
    const stall = this.stall();
    if (stall) {
      return stall.stallImg || stall.hasPromo;
    } else {
      return false;
    }
  });

  defaultAvatar: string = 'https://images.plurk.com/3rbw6tg1lA5dEGpdKTL8j1.png';

  ngOnInit() {
    this._selectStallService.selectedStallId$.pipe().subscribe((stallId) => {
      console.debug('stall modal select stall: ', stallId);
      this.isMarkedSignal.set(false);
      this.imageLoaded.set(false);
      requestAnimationFrame(() => {
        this.stall.set(this._selectStallService.selectedStall);
        if (stallId) {
          this.open.emit(true);
          this.updateStallInfo(stallId);
        }
      });
    });

    // 切換 stall 時更新 marked 狀態
    combineLatest([this.stall$, this._markedStallService.fetchEnd$.pipe(first((val) => !!val))])
      .pipe()
      .subscribe(([stall]) => {
        let isMarked = false;
        if (stall) {
          const stallId = stall.id;
          isMarked = this._markedStallService.isMarked(stallId);
        }
        this.isMarkedSignal.set(isMarked);
      });
  }

  // 手動更新 marked 狀態
  toggleBookmark() {
    const marked = !this.isMarkedSignal();
    this.isMarkedSignal.set(marked);

    const stall = this.stall();
    if (stall) {
      this._markedStallService.update(stall.id, marked);
    }
  }

  /**
   * Populates and opens the modal for a specific stall.
   * @param stallId The ID of the stall to display.
   * @param context An object containing all necessary dependencies.
   */
  updateStallInfo(stallId: string) {
    // const { elements, magnifierController, uiState } = context;
    const stall = this._stallService.findStall(stallId);
    console.debug('openＭodal stall:', stall);
    if (!stall) return;

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

    const promoLinks = stall.promoData
      .map((data) => {
        const links = data.promoLinks.filter((link) => !!link.href);
        return links;
      })
      .filter((links) => {
        return links.length;
      })
      .flat();

    this.promoLinks.set(promoLinks);
    if (stall.stallLink) promoLinks.push({ href: stall.stallLink, text: '社團網站' });
  }
  /**
   * Hides the modal and clears any selection.
   * @param context An object containing all necessary dependencies.
   */
  closeModal() {
    this._selectStallService.clearSelection();
    this._stallModalService.hide();

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
}
