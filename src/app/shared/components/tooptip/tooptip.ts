import { CommonModule } from '@angular/common';
import { Component, ElementRef, inject, OnInit, ViewChild } from '@angular/core';
import { TooltipService } from 'src/app/core/services/state/tooltip-service';

@Component({
  selector: 'app-tooptip',
  imports: [CommonModule],
  templateUrl: './tooptip.html',
  styleUrl: './tooptip.scss',
})
export class Tooptip implements OnInit {
  @ViewChild('tooltip') tooltipEl!: ElementRef<HTMLDivElement>;

  left: number = 0;
  top: number = 0;

  private _tooltipService = inject(TooltipService);
  show$ = this._tooltipService.showTooltip$;
  innerHTML$ = this._tooltipService.innerHTML$;

  ngOnInit() {
    this.show$.subscribe(() => {
      const target = this._tooltipService.target;
      if (!target) {
        return;
      }
      const targetRect = target.getBoundingClientRect();
      // Make the tooltip visible to correctly calculate its dimensions for centering.
      // This all happens in one execution thread, so it won't cause a visual flicker.
      const tooltipRect = this.tooltipEl.nativeElement.getBoundingClientRect();

      // Position it centered above the button.
      const top = targetRect.top - tooltipRect.height - 8; // 8px gap.
      const left = targetRect.left + targetRect.width / 2 - tooltipRect.width / 2;

      this.top = top;
      this.left = left;
    });
  }
}
