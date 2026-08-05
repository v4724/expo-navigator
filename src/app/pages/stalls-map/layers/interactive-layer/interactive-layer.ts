import {
  Component,
  ElementRef,
  inject,
  OnInit,
  signal,
  ViewChild,
  WritableSignal,
} from '@angular/core';
import { BaseLayer } from '../base-layer';
import { toSignal } from '@angular/core/rxjs-interop';
import { StallData } from 'src/app/core/interfaces/stall.interface';
import { map, of } from 'rxjs';
import { TooltipModule } from 'primeng/tooltip';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-interactive-layer',
  imports: [CommonModule, TooltipModule],
  templateUrl: './interactive-layer.html',
  styleUrl: './interactive-layer.scss',
})
export class InteractiveLayer extends BaseLayer implements OnInit {
  @ViewChild('stallCanvas') declare canvasRef: ElementRef<HTMLCanvasElement>;

  _hoveredStallRef!: ElementRef<HTMLDivElement>;
  @ViewChild('hoveredStallRef') set hoveredStallRef(content: ElementRef<HTMLDivElement>) {
    if (content) {
      // 當元素被渲染出來時，這裡會被執行
      this._hoveredStallRef = content;
      this.updateHoverdStallInfo(content);
    }
  }

  hoveredStall: WritableSignal<StallData | undefined> = signal(undefined);

  selectedStall = toSignal(
    this._selectStallService.selectedStallId$.pipe(
      map(() => this._selectStallService.selectedStall),
    ),
  );

  constructor() {
    super();
  }

  ngOnInit() {
    this._selectStallService.selectedStallId$.subscribe(() => {
      this.drawStall();
    });
  }

  drawStall() {
    const canvas = this.canvasRef?.nativeElement;
    const img = this.mapImage();

    if (!img || !canvas) return;
    this.loadLegendColor();

    // 設定畫布解析度與圖片一致
    if (this.canvasWH().width != canvas.width || this.canvasWH().height != canvas.height) {
      // console.log('5');
      canvas.width = this.canvasWH().width;
      canvas.height = this.canvasWH().height;
    }
    const ctx = canvas?.getContext('2d')!;
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // 設定樣式
    ctx.font = '12px Arial';
    ctx.textAlign = 'center';

    const s = this.selectedStall();
    const hs = this.hoveredStall();
    if (s) {
      // 將百分比座標轉換為畫布像素座標
      let { x, y, w, h } = this.getCanvasCoord(s);
      this.drawSelectedStall(s, ctx, x, y, w, h);
    }

    if (hs) {
      let { x, y, w, h } = this.getCanvasCoord(hs);
      const scale = 1.4;
      const dw = w * (scale - 1);
      const dh = h * (scale - 1);
      x -= dw / 2;
      y -= dh / 2;
      w *= scale;
      h *= scale;
      ctx.font = '14px Arial';
      if (s?.id === hs.id) {
        this.drawSelectedStall(hs, ctx, x, y, w, h);
      } else {
        this.drawDefaultStall(hs, ctx, x, y, w, h);
      }
      ctx.strokeStyle = '#000';
      ctx.lineWidth = 1;
      ctx.strokeRect(x, y, w, h);
    }
  }

  onMapClick(event: MouseEvent) {
    // 1. 取得容器的邊界（這會包含 CSS scale 之後的實際顯示寬高）
    const rect = (event.currentTarget as HTMLElement).getBoundingClientRect();

    // 2. 計算滑鼠點擊位置在該容器內的相對百分比 (%)
    // 我們不需要考慮 CSS scale 是多少，因為 getBoundingClientRect 抓到的是畫面上看到的寬高
    const clickX = ((event.clientX - rect.left) / rect.width) * 100;
    const clickY = ((event.clientY - rect.top) / rect.height) * 100;

    // 3. 從 Signal 中尋找是否有攤位包含這個座標
    // 這裡使用 find()，一旦找到第一個符合的就停止

    const selectedStall = this.stalls().find((s) => {
      return (
        clickX >= s.coords.left &&
        clickX <= s.coords.left + s.coords.width &&
        clickY >= s.coords.top &&
        clickY <= s.coords.top + s.coords.height
      );
    });

    if (selectedStall) {
      this._selectStallService.selected = selectedStall.id;
    }
  }

  // 偵測滑鼠指到哪個攤位
  onMouseMove(event: MouseEvent) {
    const rect = (event.target as HTMLElement).getBoundingClientRect();
    const mouseX = ((event.clientX - rect.left) / rect.width) * 100;
    const mouseY = ((event.clientY - rect.top) / rect.height) * 100;

    // 2000 個資料搜尋大約只需 1-2ms，遠快於 DOM 渲染
    const hoveredStall = this.stalls().find((s) => {
      return (
        mouseX >= s.coords.left &&
        mouseX <= s.coords.left + s.coords.width &&
        mouseY >= s.coords.top &&
        mouseY <= s.coords.top + s.coords.height
      );
    });
    this.hoveredStall.set(hoveredStall);
    this.updateHoverdStallInfo(this._hoveredStallRef);

    this.drawStall();
  }

  private drawSelectedStall(
    s: StallData,
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    w: number,
    h: number,
  ) {
    ctx.fillStyle = this.getRGBColor(this.legendColor?.selected);
    ctx.fillRect(x, y, w, h);

    ctx.fillStyle = '#fff';
    ctx.fillText(s.padNum, x + w / 2, y + h / 2 + 4);
  }

  private updateHoverdStallInfo(content?: ElementRef<HTMLDivElement>) {
    if (!content) return;
    const rect = content.nativeElement.getBoundingClientRect();
    const info = { rect, s: this.hoveredStall() };
    this._stallService.hoveredStallInfo = info;
  }
}
