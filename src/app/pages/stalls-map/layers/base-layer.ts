import { ElementRef, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { StallData } from 'src/app/core/interfaces/stall.interface';
import { SelectStallService } from 'src/app/core/services/state/select-stall-service';
import { StallMapService } from 'src/app/core/services/state/stall-map-service';
import { StallService } from 'src/app/core/services/state/stall-service';
import { UiStateService } from 'src/app/core/services/state/ui-state-service';

interface LegendColor {
  default: string;
  promo: string;
  printSurvey: string;
  search: string;
  selected: string;
  hover: string;
}

export interface CanvasCoord {
  x: number;
  y: number;
  w: number;
  h: number;
}

export class BaseLayer {
  canvasRef!: ElementRef<HTMLCanvasElement>;

  legendColor?: LegendColor;

  protected _uiStateService = inject(UiStateService);
  protected _stallService = inject(StallService);
  protected _stallMapService = inject(StallMapService);
  protected _selectStallService = inject(SelectStallService);

  stalls = toSignal(
    this._stallService.allStalls$,
    { initialValue: [] }, // 給予初始空陣列避免前端讀取 undefined
  );
  mapImage = toSignal(this._stallMapService.mapImage$);

  isBackground = false;

  drawStalls() {
    const canvas = this.canvasRef?.nativeElement;
    const ctx = canvas?.getContext('2d')!;
    const img = this.mapImage();

    if (!img || !canvas) return;
    this.loadLegendColor();

    // 設定畫布解析度與圖片一致
    canvas.width = img.naturalWidth;
    canvas.height = img.naturalHeight;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // 設定樣式
    ctx.font = '12px Arial';
    ctx.textAlign = 'center';

    this.stalls().forEach((s) => {
      // 將百分比座標轉換為畫布像素座標
      const { x, y, w, h } = this.getCanvasCoord(s);
      this.drawDefaultStall(s, ctx, x, y, w, h);
    });
  }

  loadLegendColor() {
    if (this.legendColor) {
      return;
    }
    this.legendColor = {
      default: this.getCssVariable('--legend-default'),
      promo: this.getCssVariable('--legend-promo'),
      printSurvey: this.getCssVariable('--legend-print-survey'),
      search: this.getCssVariable('--legend-search'),
      selected: this.getCssVariable('--legend-selected'),
      hover: this.getCssVariable('--legend-hover'),
    };
  }

  getCssVariable(variableName: string): string {
    if (!this._uiStateService.isPlatformBrowser()) return '';

    const root = document.documentElement;

    const style = getComputedStyle(root);
    const value = style.getPropertyValue(variableName).trim();

    return value;
  }

  protected getFillColor(s: StallData): string {
    const hasPromo = s.hasPromo;

    // 有順序性
    let color = this.legendColor?.default;
    if (hasPromo) {
      color = this.getRGBColor(this.legendColor?.promo);
    }
    return color ?? '';
  }

  protected drawPrintSurvey(
    s: StallData,
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    w: number,
    h: number,
  ) {
    const hasPrintSurvey = s.hasPrintSurvey;
    if (!hasPrintSurvey) return;

    const color = this.getRGBColor(this.legendColor?.printSurvey);
    ctx.strokeStyle = color;
    ctx.fillStyle = color;

    // 畫右上方的三角形
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x + w, y);
    ctx.lineTo(x + w, y + h);
    ctx.closePath();
    ctx.fill();
  }

  protected getRGBColor(val?: string) {
    return val ? `rgb(${val})` : '';
  }

  // 將百分比座標轉換為畫布像素座標
  protected getCanvasCoord(s: StallData): CanvasCoord {
    const canvas = this.canvasRef?.nativeElement;

    const x = (s.coords.left / 100) * canvas.width;
    const y = (s.coords.top / 100) * canvas.height;
    const w = (s.coords.width / 100) * canvas.width;
    const h = (s.coords.height / 100) * canvas.height;

    return { x, y, w, h };
  }

  protected drawDefaultStall(
    s: StallData,
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    w: number,
    h: number,
  ) {
    const color = this.getFillColor(s);
    ctx.strokeStyle = color;
    ctx.fillStyle = color;

    // 畫攤位方框
    ctx.fillRect(x, y, w, h);
    ctx.strokeRect(x, y, w, h);

    // 畫印量調查
    this.drawPrintSurvey(s, ctx, x, y, w, h);

    // 畫編號 (若縮放太小可隱藏文字優化效能)
    // if (this.scale() > 2) {
    ctx.fillStyle = '#000';
    ctx.fillText(s.padNum, x + w / 2, y + h / 2 + 4);
  }
}
