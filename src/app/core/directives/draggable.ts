import { isNgTemplate } from '@angular/compiler';
import {
  Directive,
  ElementRef,
  HostListener,
  inject,
  input,
  NgZone,
  OnDestroy,
  output,
} from '@angular/core';
import { DraggableService } from '../services/state/draggable-service';
import { UiStateService } from '../services/state/ui-state-service';

export interface TargetXY {
  x: number;
  y: number;
}

@Directive({
  selector: '[appDraggable]',
})
export class Draggable implements OnDestroy {
  initVal = input<boolean>(false);
  initX = input<number>();
  initY = input<number>();
  dragAnimationLoop = output<TargetXY>();
  onDragstart = output<PointerEvent>();
  onDragmove = output<PointerEvent>();
  onDragend = output<PointerEvent>();

  isDragging = false;
  // Variables to track drag state.
  // 拖曳起點
  dragStartX = 0;
  dragStartY = 0;
  // 元件起點位置
  initialLensX = 0;
  initialLensY = 0;
  // 元件拖曳後終點位置
  targetBgX: number = 0;
  targetBgY: number = 0;
  dragHappened = false; // Differentiates a click from a drag.
  // 拖曳動畫id
  animationFrameId: number = 0;

  private _el = inject(ElementRef);
  private _ngZone = inject(NgZone);
  private _draggableService = inject(DraggableService);
  private _uiStateService = inject(UiStateService);

  constructor() {}

  ngOnDestroy(): void {
    if (this._uiStateService.isPlatformBrowser()) cancelAnimationFrame(this.animationFrameId);
  }

  // --- Unified Drag and Interaction Handlers for Mouse and Touch ---
  @HostListener('pointerdown', ['$event'])
  onDragStart(e: PointerEvent) {
    this._draggableService.isDragging = true;
    this.isDragging = true;
    this.dragHappened = false; // Reset for the new interaction.
    const clientX = e.clientX;
    const clientY = e.clientY;
    // Record the starting position of the mouse/touch and the lens.
    this.dragStartX = clientX;
    this.dragStartY = clientY;

    let offsetX = this._el.nativeElement.offsetLeft;
    let offsetY = this._el.nativeElement.offsetTop;
    if (this.initVal()) {
      offsetX = this.initX();
      offsetY = this.initY();
    }

    // const offsetX = clientX;
    // const offsetY = clientY;
    this.initialLensX = offsetX;
    this.initialLensY = offsetY;
    this.targetBgX = offsetX;
    this.targetBgY = offsetY;

    if (this._uiStateService.isPlatformBrowser()) cancelAnimationFrame(this.animationFrameId);
    this.animationFrameId = requestAnimationFrame(this._panAnimationLoop);

    // performance: run outside angular
    this._ngZone.runOutsideAngular(() => {
      window.addEventListener('pointermove', this.onDragMove, { passive: false });
      window.addEventListener('pointerup', this.onDragEnd, { once: true });
    });
    this.onDragstart.emit(e);
    console.debug('onDragStart 起點 initialLensXY', this.initialLensX, this.initialLensY);
  }

  onDragMove = (e: PointerEvent) => {
    if (!this.isDragging) return;
    const clientX = e.clientX;
    const clientY = e.clientY;
    // 全域視窗座標的移動距離
    const dx = clientX - this.dragStartX; // Change in mouse/touch X.
    const dy = clientY - this.dragStartY; // Change in mouse/touch Y.
    // Check if movement exceeds a threshold to be considered a drag.
    if (!this.dragHappened && (Math.abs(dx) > 5 || Math.abs(dy) > 5)) {
      this.dragHappened = true;
    }
    if (this.dragHappened) {
      this.targetBgX = this.initialLensX + dx;
      this.targetBgY = this.initialLensY + dy;
    }
    console.debug('onDragMove 移動距離', dx, dy);
    console.debug('onDragMove 移動位置', this.targetBgX, this.targetBgY);
    this.onDragmove.emit(e);
  };

  onDragEnd = (e: PointerEvent) => {
    if (!this.isDragging) return;
    this.isDragging = false;
    this._draggableService.isDragging = false;

    cancelAnimationFrame(this.animationFrameId);

    window.removeEventListener('pointermove', this.onDragMove);

    this.onDragend.emit(e);
  };

  _panAnimationLoop = () => {
    if (!this.isDragging) return;
    this.dragAnimationLoop.emit({ x: this.targetBgX, y: this.targetBgY });
    this.animationFrameId = requestAnimationFrame(this._panAnimationLoop);
  };
}
