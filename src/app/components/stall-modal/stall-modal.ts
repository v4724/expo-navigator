import { Component, HostListener, inject, signal, ViewChild, WritableSignal } from '@angular/core';
import { LightboxService } from 'src/app/core/services/state/lightbox-service';
import { StallModalService } from 'src/app/core/services/state/stall-modal-service';
import { MiniMap } from '../mini-map/mini-map';
import { CommonModule } from '@angular/common';
import { StallService } from 'src/app/core/services/state/stall-service';
import { UiStateService } from 'src/app/core/services/state/ui-state-service';
import { StallData } from '../stall/stall-.interface';
import { filter, map } from 'rxjs';
import { toObservable } from '@angular/core/rxjs-interop';
import { PromoLink } from 'src/app/core/interfaces/promo-link.interface';
import { link } from 'fs';

declare global {
  interface Window {
    instgrm?: {
      Embeds: {
        process: () => void;
      };
    };
    twttr?: {
      widgets: {
        load: (el: HTMLElement) => void;
      };
    };
  }
}

// Module-level state for the modal
const modalState = {
  wasMagnifierVisible: false,
  // Panning state for all devices
  isPanning: false,
  panStartX: 0,
  panStartY: 0,
  initialBgX: 0,
  initialBgY: 0,
  panHappened: false,
  clickTarget: null as EventTarget | null,
  // State for smooth panning with requestAnimationFrame
  animationFrameId: 0,
  targetBgX: 0,
  targetBgY: 0,
};
@Component({
  selector: 'app-stall-modal',
  imports: [MiniMap, CommonModule],
  templateUrl: './stall-modal.html',
  styleUrl: './stall-modal.scss',
})
export class StallModal {
  @ViewChild(MiniMap) miniMap!: MiniMap;

  private _stallModalService = inject(StallModalService);
  private _lightboxService = inject(LightboxService);
  private _stallService = inject(StallService);
  private _uiStateService = inject(UiStateService);

  show$ = this._stallModalService.showStallModal$;
  stall: WritableSignal<StallData | undefined> = signal<StallData | undefined>(undefined);
  promoLinks: WritableSignal<PromoLink[]> = signal<PromoLink[]>([]);
  imageLoaded: WritableSignal<boolean> = signal<boolean>(false);

  hasPromoInfo$ = toObservable(this.stall).pipe(
    map((stall) => {
      if (stall) {
        return stall.stallImg || stall.hasPromo;
      } else {
        return false;
      }
    }),
  );

  defaultAvatar: string = 'https://images.plurk.com/3rbw6tg1lA5dEGpdKTL8j1.png';

  ngOnInit() {
    this._stallService.selectedStallId$.subscribe((stallId) => {
      console.debug('stall modal select stall: ', stallId);
      this.stall.set(this._stallService.selectedStall);
      if (stallId) {
        this.openModal(stallId);
      } else {
        this.imageLoaded.set(false);
      }
    });
  }

  /**
   * Populates and opens the modal for a specific stall.
   * @param stallId The ID of the stall to display.
   * @param context An object containing all necessary dependencies.
   */
  openModal(stallId: string) {
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

    // Show Modal
    document.body.classList.add('body-modal-open');
    this._stallModalService.show();

    this.miniMap.updateModalMagnifierView(stall);
  }
  /**
   * Hides the modal and clears any selection.
   * @param context An object containing all necessary dependencies.
   */
  closeModal() {
    // const { elements, magnifierController, uiState } = context;

    this._stallService.clearSelection();
    this._stallModalService.hide();
    // TODO 作用?
    // this.document.body.classList.remove('body-modal-open');

    // if (magnifierController && modalState.wasMagnifierVisible) {
    //   magnifierController.show();
    // }
    // modalState.wasMagnifierVisible = false;
    // elements.modalMagnifierWrapper.style.display = 'none';
    // elements.modalVerticalStallList.style.display = 'none';
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

  @HostListener('keydown', ['$event'])
  keydownHandler(e: KeyboardEvent) {
    if (this._stallModalService.isHidden()) return;

    switch (e.key) {
      case 'Escape':
        this.closeModal();
        break;
    }
  }
}
