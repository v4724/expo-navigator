import { CdkDrag, CdkDragEnd, CdkDragMove, CdkDragStart } from '@angular/cdk/drag-drop';
import { CommonModule } from '@angular/common';
import { Component, computed, input } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { DrawerModule } from 'primeng/drawer';

@Component({
  selector: 'app-drawer-on-mobile',
  imports: [DrawerModule, CommonModule, ButtonModule, CdkDrag],
  templateUrl: './drawer-on-mobile.html',
  styleUrl: './drawer-on-mobile.scss',
})
export class DrawerOnMobile {
  styleClass = input<string>('');
  title = input<boolean>(true);

  visible = false;

  drawerHeight = 300;
  startHeight = 300;
  dragStartY = 0;

  firstMove = false;
  snapPoints = [0, 0.25, 0.5, 0.9]; // 25%、50%、90%

  _styleClass = computed(() => {
    return this.styleClass() + ' !transition-all duration-100 !shadow-[0_-1px_5px_rgba(0,0,0,0.1)]';
  });

  show() {
    this.visible = true;
    this.drawerHeight = window.innerHeight * 0.5;
  }

  close() {
    this.visible = false;
  }

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
