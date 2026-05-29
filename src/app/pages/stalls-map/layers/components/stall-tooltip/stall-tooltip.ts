import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { TooltipModule } from 'primeng/tooltip';
import { StallService } from 'src/app/core/services/state/stall-service';

/** 攤位 hover tooltip */
@Component({
  selector: 'app-stall-tooltip',
  imports: [CommonModule, TooltipModule],
  templateUrl: './stall-tooltip.html',
  styleUrl: './stall-tooltip.scss',
})
export class StallTooltip {
  private _stallService = inject(StallService);
  hoveredStallInfo = toSignal(this._stallService.hoveredStallInfo$);

  // 為了讓 click 事件可以傳到底下的互動層
  passThroughEvent(event: MouseEvent) {
    // 1. 暫時隱藏自己
    const target = event.currentTarget as HTMLElement;
    target.style.pointerEvents = 'none';

    // 2. 找到點擊位置下方的真正元素
    const underlyingElement = document.elementFromPoint(event.clientX, event.clientY);

    // 3. 手動觸發該元素的點擊
    if (underlyingElement) {
      underlyingElement.dispatchEvent(
        new MouseEvent('click', {
          bubbles: true,
          cancelable: true,
          view: window,
          clientX: event.clientX,
          clientY: event.clientY,
        }),
      );
    }

    // 4. 恢復自己的 pointer-events
    target.style.pointerEvents = 'auto';
  }

  forwardWheel(event: WheelEvent) {
    // 1. 暫時將自己的點擊/滑鼠事件關閉，否則 elementFromPoint 只會一直抓到自己
    const target = event.currentTarget as HTMLElement;
    target.style.pointerEvents = 'none';

    // 2. 根據滑鼠目前的座標，取得「正下方」的實際元素（例如你的地圖畫布）
    const underElement = document.elementFromPoint(event.clientX, event.clientY);

    // 3. 如果有找到下層元素，就重新觸發一個一模一樣的 WheelEvent
    if (underElement) {
      const clonedEvent = new WheelEvent('wheel', {
        deltaX: event.deltaX,
        deltaY: event.deltaY,
        deltaZ: event.deltaZ,
        deltaMode: event.deltaMode,
        clientX: event.clientX,
        clientY: event.clientY,
        screenX: event.screenX,
        screenY: event.screenY,
        bubbles: true, // 允許冒泡
        cancelable: true,
      });
      underElement.dispatchEvent(clonedEvent);
    }

    // 4. 還原自己的 pointer-events 設定
    target.style.pointerEvents = 'auto';
  }
}
