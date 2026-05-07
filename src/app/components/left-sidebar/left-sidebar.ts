import { Component, inject } from '@angular/core';
import { ResultList } from 'src/app/components/search-and-filter/result-list/result-list';
import { AdvancedSeriesTagDrawer } from '../search-and-filter/advanced-series-tag-drawer/advanced-series-tag-drawer';
import { MarkedListDrawer } from 'src/app/shared/components/marked-list/marked-list-drawer/marked-list-drawer';
import { ExpoStateService } from 'src/app/core/services/state/expo-state-service';
import { toSignal } from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-left-sidebar',
  imports: [ResultList, AdvancedSeriesTagDrawer, MarkedListDrawer],
  templateUrl: './left-sidebar.html',
  styleUrl: './left-sidebar.scss',
})
export class LeftSidebar {
  private _expoStateService = inject(ExpoStateService);

  promoCustomTagOnly = toSignal(this._expoStateService.promoCustomTagOnly$);
}
