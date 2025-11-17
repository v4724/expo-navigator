import { inject, Injectable } from '@angular/core';
import { DialogService } from 'primeng/dynamicdialog';
import { StallSeries } from 'src/app/core/interfaces/stall-series-tag.interface';
import { AdvancedSeriesTag } from './advanced-series-tag';

@Injectable({
  providedIn: 'root',
})
export class AdvancedSeriesTagService {
  private _dialogService = inject(DialogService);

  show(series: StallSeries) {
    this._dialogService.open(AdvancedSeriesTag, {
      header: `進階篩選: ${series.name}`,
      width: '25rem',
      inputValues: { series: series },
      contentStyle: { overflow: 'auto' },
      baseZIndex: 10000,
      closable: true,
      modal: true,
      dismissableMask: true,
    });
  }
}
