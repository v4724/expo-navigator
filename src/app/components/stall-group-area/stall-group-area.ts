import { CommonModule } from '@angular/common';
import {
  Component,
  computed,
  inject,
  input,
  InputSignal,
  OnInit,
  signal,
  ViewChild,
} from '@angular/core';
import { debounceTime } from 'rxjs';
import { StallGridDef } from 'src/app/core/interfaces/stall-def.interface';
import { SelectStallService } from 'src/app/core/services/state/select-stall-service';
import { StallMapService } from 'src/app/core/services/state/stall-map-service';
import { Popover } from 'primeng/popover';
import { StallService } from 'src/app/core/services/state/stall-service';
import { StallData } from 'src/app/core/interfaces/stall.interface';
import { toSignal } from '@angular/core/rxjs-interop';
import { TooltipModule } from 'primeng/tooltip';
import { Bookmarks } from './bookmarks/bookmarks';
import { Bookmark } from './bookmark/bookmark';
import { MarkedStallService } from 'src/app/core/services/state/marked-stall-service';

@Component({
  selector: 'app-stall-group-area',
  imports: [CommonModule, Popover, TooltipModule, Bookmarks, Bookmark],
  templateUrl: './stall-group-area.html',
  styleUrl: './stall-group-area.scss',
})
export class StallGroupArea implements OnInit {
  @ViewChild(Popover) popover!: Popover;

  zone: InputSignal<StallGridDef> = input.required();

  private _selectStallService = inject(SelectStallService);
  private _stallMapService = inject(StallMapService);
  private _markedListService = inject(MarkedStallService);
  private _stallService = inject(StallService);

  popoverAnchorTop = signal<string>('0');
  isMatch = signal<boolean>(false);

  stalls = computed(() => {
    const zoneDef = this.zone();
    const stalls = this._stallService.allStalls
      .filter((stall) => {
        return stall.stallZone === zoneDef.zoneId;
      })
      .sort((a, b) => {
        return a.stallNum - b.stallNum;
      });
    return stalls;
  });

  direction = computed(() => {
    const zoneDef = this.zone();
    return zoneDef?.stallDefs[0].direction;
  });

  selectedId = toSignal(this._selectStallService.selectedStallId$);

  showMarkLayer = toSignal(this._markedListService.layerShown$);

  private _matchStallIds = toSignal(this._stallMapService.matchStallsId$);
  matchStallIds = computed(() => {
    const matchStallIds = this._matchStallIds();
    const zoneDef = this.zone();
    if (!zoneDef || !matchStallIds) {
      return new Set();
    }
    const matched = matchStallIds.get(zoneDef?.zoneId);
    if (matched) {
      return matched;
    }
    return new Set();
  });

  ngOnInit() {
    // Update the visible group area elements based on whether any stall in that row matched
    this._stallMapService.matchStallsId$.pipe(debounceTime(100)).subscribe((map) => {
      const isMatch = (map.get(this.zone().zoneId)?.size ?? 0) > 0;
      this.isMatch.set(isMatch);
    });
  }

  stallGroupClicked(popover: Popover, e: Event, target: HTMLDivElement) {
    const clickTarget = e.target as HTMLDivElement;
    if (clickTarget) {
      const rect = clickTarget.getBoundingClientRect();
      const top = rect.top;
      const h = rect.height;
      const popoverH = 380;
      const viewportH = window.innerHeight;
      let anchorTop = '0px';
      if (top < 50) {
        anchorTop = `${(Math.abs(top) / h) * 100}%`;
      } else if (top + popoverH >= viewportH) {
        anchorTop = `-${((popoverH - (viewportH - top)) / h) * 100}%`;
      } else {
        anchorTop = '0px';
      }
      this.popoverAnchorTop.set(anchorTop);
    }

    requestAnimationFrame(() => {
      popover.toggle(e, target);
    });
  }

  stallClicked(stall: StallData) {
    this._selectStallService.selected = stall.id;
  }

  onPopoverShow() {
    const popoverEl = this.popover?.container;
    if (popoverEl) {
      let top = this.popoverAnchorTop();
      if (top === '0px') {
        top = `10%`;
      } else if (top.startsWith('-')) {
        top = top.substring(1);
        const int = Number(top.split('.')[0]);
        if (int > 90) {
          top = `90%`;
        }
      }
      popoverEl.style.setProperty('--arrow-top', `${top}`);
    }
  }
}
