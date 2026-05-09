import {
  AfterViewInit,
  Component,
  effect,
  ElementRef,
  inject,
  OnInit,
  ViewChild,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { BaseLayer } from '../base-layer';

@Component({
  selector: 'app-stalls-canvas',
  imports: [CommonModule],
  template: `<canvas #stallCanvas class="absolute top-0 left-0 w-full h-full pointer-events-none">
  </canvas>`,
  styleUrl: './stalls-canvas.scss',
})
export class StallsCanvas extends BaseLayer implements OnInit {
  @ViewChild('stallCanvas') declare canvasRef: ElementRef<HTMLCanvasElement>;

  constructor() {
    super();

    this.isBackground = true;

    effect(() => {
      const data = this.stalls();
      if (data.length > 0) {
        // 當攤位資料載入或變更時，觸發繪圖
        // 包在 requestAnimationFrame 確保在瀏覽器準備好時才畫
        if (this._uiStateService.isPlatformBrowser()) {
          requestAnimationFrame(() => {
            this.drawStalls();
          });
        }
      }
    });
  }

  ngOnInit() {}
}
