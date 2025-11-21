import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { DrawerModule } from 'primeng/drawer';
import { CdkDrag, CdkDragEnd, CdkDragMove, CdkDragStart } from '@angular/cdk/drag-drop';
import { toSignal } from '@angular/core/rxjs-interop';
import { MarkedStallService } from 'src/app/core/services/state/marked-stall-service';
import { OnlyArea } from 'src/app/components/layers-controller/only-area/only-area';
import { StallsLayer } from 'src/app/components/layers-controller/stalls-layer/stalls-layer';

@Component({
  selector: 'app-control-layers-drawer',
  imports: [CommonModule, ButtonModule, DrawerModule, CdkDrag, StallsLayer, OnlyArea],
  templateUrl: './control-layers-drawer.html',
  styleUrl: './control-layers-drawer.scss',
})
export class ControlLayersDrawer {
  visible = false;

  drawerHeight = 300;
  startHeight = 300;
  dragStartY = 0;

  private _markedListService = inject(MarkedStallService);

  showMarkedListLayer = toSignal(this._markedListService.layerShown$);

  toggleLayer() {
    this._markedListService.toggleLayer();
  }

  show() {
    this.visible = true;
    this.drawerHeight = window.innerHeight * 0.5;
  }

  close() {
    this.visible = false;
  }

  firstMove = false;
  snapPoints = [0, 0.25, 0.5, 0.9]; // 25%、50%、90%

  onDragStart(event: CdkDragStart) {
    this.startHeight = this.drawerHeight;
    this.firstMove = true;
  }

  onDrag(event: CdkDragMove) {
    if (this.firstMove) {
      this.dragStartY = event.pointerPosition.y;
      this.firstMove = false;
    }

    const deltaY = event.distance.y; // 這次拖曳移動量
    const newHeight = this.startHeight - deltaY;

    this.applyDrawerHeight(newHeight);
  }

  onDragEnd(event: CdkDragEnd) {
    const newHeight = this.drawerHeight;
    const screenH = window.innerHeight;

    // 找出最近的 snap point
    let closest = this.snapPoints[0] * screenH;
    let minDiff = Math.abs(newHeight - closest);

    for (const p of this.snapPoints) {
      const h = p * screenH;
      const diff = Math.abs(newHeight - h);
      if (diff < minDiff) {
        minDiff = diff;
        closest = h;
      }
    }

    // 移到斷點
    this.applyDrawerHeight(closest);

    // 重置拖曳位置（非常重要）
    event.source.reset();
  }

  applyDrawerHeight(height: number) {
    const screenH = window.innerHeight;
    const minH = screenH * 0.1;
    const maxH = screenH * 1;

    height = Math.max(minH, Math.min(maxH, height));
    this.drawerHeight = height;
  }
}
