import { Component, inject, input, signal } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { toJpeg } from 'html-to-image';
import { MessageService } from 'primeng/api';
import { TooltipModule } from 'primeng/tooltip';

@Component({
  selector: 'app-download-map',
  imports: [TooltipModule, MatIconModule],
  templateUrl: './download-map.html',
  styleUrl: './download-map.scss',
})
export class DownloadMap {
  elId = input();

  downloadLoading = signal<boolean>(false);

  private readonly _messageService = inject(MessageService);

  download() {
    if (this.downloadLoading()) return;

    const element: HTMLElement | null = document.querySelector(`#${this.elId()}`);
    if (element) {
      this.downloadLoading.set(true);
      this.html2Image(element)
        .catch((e) => {
          console.error('下載地圖錯誤', e);
          this._messageService.add({
            severity: 'custom',
            summary: `下載地圖錯誤 ${e.message}`,
            sticky: true,
            closable: true,
            data: {
              type: 'warning',
            },
          });
        })
        .finally(() => {
          this.downloadLoading.set(false);
        });
    }
  }

  html2Image(element: HTMLElement) {
    return toJpeg(element, {
      pixelRatio: 3, // 產生兩倍解析度的圖片,
      quality: 0.95,
    }) // 設定圖片品質
      .then(function (dataUrl) {
        const link = document.createElement('a');
        link.download = 'my-image-name.jpeg';
        link.href = dataUrl;
        link.click();
      })
      .catch(function (error) {
        console.error('oops, something went wrong!', error);
      });
  }
}
