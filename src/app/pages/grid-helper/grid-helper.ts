import { CommonModule } from '@angular/common';
import { Component, computed, ElementRef, inject, signal, ViewChild } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatButtonToggleChange, MatButtonToggleModule } from '@angular/material/button-toggle';

interface Point {
  x: number;
  y: number;
}
interface Circle {
  point: Point;
  pointRatioStr: string;
}
interface Polygon {
  points: Point[];
  pointsStr: string;
  pointsRatioStr: string;
  textPointXY: Point;
  textPointRatioXY: Point;
  // 資料庫 JSON 格式
  drawingPolygonRatioJSONStr: string;
}

@Component({
  selector: 'app-grid-helper',
  imports: [CommonModule, MatButtonToggleModule],
  templateUrl: './grid-helper.html',
  styleUrl: './grid-helper.scss',
})
export class GridHelper {
  @ViewChild('mapContent') mapContent!: ElementRef<HTMLDivElement>;
  mapImgSrc = `https://cdn.jsdelivr.net/gh/v4724/nice-0816@c6b3cd1/assets/stalls-map.jpg`;
  private _snackBar = inject(MatSnackBar);

  // 圖片比例
  private imageHeightToWidthRatio = signal<number>(0);
  imageAspectRatio = computed(() => {
    const ratio = this.imageHeightToWidthRatio();
    // Provide the calculated width/height ratio, or a default 1/1 square until the image loads.
    return ratio > 0 ? 1 / ratio : 1;
  });

  isEditing = signal<boolean>(false);
  editingType = signal<'point' | 'polygon' | ''>('');
  mapWidth = signal<number>(0);
  mapHeight = signal<number>(0);

  // 完成繪製
  circles = signal<Circle[]>([]);
  polygons = signal<Polygon[]>([]);

  // 繪製中的 polygon
  drawingPolygon = signal<Point[]>([]);
  drawingPolygonStr = computed(() => {
    const str = this.drawingPolygon()
      .map((data) => {
        return `${data.x},${data.y}`;
      })
      .join(' ');
    return str;
  });
  drawingPolygonRatioStr = computed(() => {
    const str = this.drawingPolygon()
      .map((data) => {
        return this.getRatioXYStr(data.x, data.y);
      })
      .join(' ');
    return str;
  });
  drawingPolygonRatioJSONStr = computed(() => {
    return JSON.stringify(
      this.drawingPolygon().map((point) => {
        return { x: (point.x / this.mapWidth()) * 100, y: (point.y / this.mapHeight()) * 100 };
      }),
    );
  });

  getRatioXYStr(x: number, y: number) {
    return `${(x / this.mapWidth()) * 100},${(y / this.mapHeight()) * 100}`;
  }

  onMapImageLoad(event: Event) {
    const img = event.target as HTMLImageElement;
    const { naturalWidth, naturalHeight } = img;
    if (naturalWidth > 0) {
      this.imageHeightToWidthRatio.set(naturalHeight / naturalWidth);
    }

    this.mapWidth.set(img.offsetWidth);
    this.mapHeight.set(img.offsetHeight);
  }

  statusChange(e: MatButtonToggleChange) {
    const val = e.value;
    switch (val) {
      case 'end':
        this.isEditing.set(false);
        break;
      case 'point':
      case 'polygon':
        this.isEditing.set(true);
        this.editingType.set(val);
        break;
    }
  }

  pointerDown(e: PointerEvent) {
    if (!this.isEditing()) return;

    const offsetX = this.mapContent.nativeElement.offsetLeft;
    const offsetY = this.mapContent.nativeElement.offsetTop;
    const pointerClentX = e.clientX;
    const pointerClentY = e.clientY;
    if (this.editingType() === 'point') {
      const x = pointerClentX - offsetX;
      const y = pointerClentY - offsetY;
      const circle = {
        point: { x: x, y: y },
        pointRatioStr: this.getRatioXYStr(x, y),
      };
      this.circles().push(circle);
      const newCat = [...this.circles()];
      this.circles.set(newCat);
    } else {
      const point = { x: pointerClentX - offsetX, y: pointerClentY - offsetY };
      this.drawingPolygon().push(point);
      const newCat = [...this.drawingPolygon()];
      this.drawingPolygon.set(newCat);
    }
  }

  pointerMove(e: PointerEvent) {}

  pointerUp(e: PointerEvent) {}

  dblclick(e: MouseEvent) {
    if (!this.isEditing() || this.editingType() !== 'polygon') return;
    const maxX = Math.max(...this.drawingPolygon().map((point) => point.x));
    const maxY = Math.max(...this.drawingPolygon().map((point) => point.y));
    const minX = Math.min(...this.drawingPolygon().map((point) => point.x));
    const minY = Math.min(...this.drawingPolygon().map((point) => point.y));
    const centerX = (maxX + minX) / 2;
    const centerY = (maxY + minY) / 2;

    this.polygons().push({
      points: this.drawingPolygon(),
      pointsStr: this.drawingPolygonStr(),
      pointsRatioStr: this.drawingPolygonRatioStr(),
      textPointXY: {
        x: centerX,
        y: centerY,
      },
      textPointRatioXY: {
        x: (centerX / this.mapWidth()) * 100,
        y: (centerY / this.mapHeight()) * 100,
      },
      drawingPolygonRatioJSONStr: this.drawingPolygonRatioJSONStr(),
    });
    const newCat = [...this.polygons()];
    this.polygons.set(newCat);
    this.drawingPolygon.set([]);
  }

  copyText(text: string, type: 'polygon' | 'point') {
    navigator.clipboard.writeText(text);
    this._snackBar.open(`已複製 ${type} %`, '', { duration: 1000 });
  }
}
