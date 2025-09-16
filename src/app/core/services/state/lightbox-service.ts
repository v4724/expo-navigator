import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class LightboxService {
  private _showLightbox = new BehaviorSubject<boolean>(false);
  showLightbox$ = this._showLightbox.asObservable();

  private _imageSrc = new BehaviorSubject<string>('');
  imageSrc$ = this._imageSrc.asObservable();

  private _imageAlt = new BehaviorSubject<string>('');
  imageAlt$ = this._imageAlt.asObservable();

  toggleLightbox() {
    this._showLightbox.next(!this._showLightbox.value);
  }

  show() {
    this._showLightbox.next(true);
  }

  hide() {
    this._showLightbox.next(false);
    this._imageSrc.next('');
    this._imageAlt.next('');
  }

  /**
   * Opens a lightbox to display an enlarged version of an image.
   * @param src The source URL of the image to display.
   * @param alt The alternative text for the image.
   */
  openImageLightbox(src: string, alt: string) {
    this._imageSrc.next(src);
    this._imageAlt.next(alt);
    this.show();
  }
}
