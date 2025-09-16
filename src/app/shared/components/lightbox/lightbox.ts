import { CommonModule } from '@angular/common';
import { Component, HostListener, inject, OnInit, ViewChild } from '@angular/core';
import { LightboxService } from 'src/app/core/services/state/lightbox-service';

@Component({
  selector: 'app-lightbox',
  imports: [CommonModule],
  templateUrl: './lightbox.html',
  styleUrl: './lightbox.scss',
})
export class Lightbox implements OnInit {
  @ViewChild('imageLightbox', { static: true }) _imageLightbox!: HTMLElement;
  @ViewChild('imageLightboxImage', { static: true }) _imageLightboxImage!: HTMLImageElement;

  private _lightboxService: LightboxService = inject(LightboxService);
  private _showLightbox$ = this._lightboxService.showLightbox$;

  imageSrc$ = this._lightboxService.imageSrc$;
  imageAlt$ = this._lightboxService.imageAlt$;
  visible$ = this._lightboxService.showLightbox$;

  ngOnInit() {}

  /**
   * Closes the image lightbox.
   */
  closeImageLightbox(e?: Event) {
    e?.stopPropagation();
    e?.preventDefault();
    this._lightboxService.hide();
  }

  boundCloseImageLightbox(e: Event) {
    // if (
    //   e.target === elements.imageLightbox ||
    //   e.target === elements.imageLightbox.querySelector('.lightbox-overlay')
    // ) {
    this.closeImageLightbox(e);
    // }
  }

  @HostListener('keydown', ['$event'])
  handleKeyDown(e: KeyboardEvent) {
    if (this._showLightbox$) {
      if (e.key === 'Escape') {
        this.closeImageLightbox(e);
      }
      return; // Stop further key processing
    }
  }
}
