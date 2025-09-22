import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { MagnifierService } from 'src/app/core/services/state/magnifier-service';

@Component({
  selector: 'app-group-indicator',
  imports: [CommonModule],
  templateUrl: './group-indicator.html',
  styleUrl: './group-indicator.scss',
})
export class GroupIndicator {
  private _magnifierService = inject(MagnifierService);

  rowIndicatorNext$ = this._magnifierService.rowIndicatorNext$;
  rowIndicatorCurrent$ = this._magnifierService.rowIndicatorCurrent$;
  rowIndicatorPrev$ = this._magnifierService.rowIndicatorPrev$;
}
