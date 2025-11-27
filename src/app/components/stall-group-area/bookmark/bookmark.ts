import { CommonModule } from '@angular/common';
import { Component, computed, inject, input, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { MatIcon } from '@angular/material/icon';
import { filter } from 'rxjs';
import { StallData } from 'src/app/core/interfaces/stall.interface';
import { MarkedStallService } from 'src/app/core/services/state/marked-stall-service';
import { StallMapService } from 'src/app/core/services/state/stall-map-service';
import { StallService } from 'src/app/core/services/state/stall-service';
import { UserService } from 'src/app/core/services/state/user-service';

@Component({
  selector: 'app-bookmark',
  imports: [CommonModule, MatIcon],
  templateUrl: './bookmark.html',
  styleUrl: './bookmark.scss',
})
export class Bookmark {
  stall = input.required<StallData>();

  private _stallService = inject(StallService);
  private _markedListService = inject(MarkedStallService);
  private _stallMapService = inject(StallMapService);
  private _userService = inject(UserService);

  isLogin = toSignal(this._userService.isLogin$);
  showMarkLayer = toSignal(this._markedListService.layerShown$);
  allMarkedList = toSignal(this._markedListService.markedList$);

  // 書籤清單查詢
  markedMapByStallId = toSignal(this._markedListService.markedMapByStallId$);

  fontSizeNum = signal<number>(8);
  fontSize = signal<string>('0.5rem');
  iconSize = signal<string>('0.25rem');

  // 有被加入的書籤set
  bookmarkSet = computed(() => {
    const map = this.markedMapByStallId();
    if (!map) return new Set();

    const set = map.get(this.stall().id);
    if (!set?.size) {
      return new Set();
    }
    return set;
  });

  ngOnInit(): void {
    this._stallService.fetchEnd$.pipe(filter((val) => !!val)).subscribe(() => {
      this.setIconSize(this.stall());
    });
  }

  setIconSize(stall: StallData) {
    const mapH = this._stallMapService.mapContentWH.h;
    if (mapH) {
      const h = 28;
      const fontSize = h * 0.7;

      this.fontSizeNum.set(Math.round(fontSize));
      this.fontSize.set(`${Math.round(fontSize)}px`);
      this.iconSize.set(`${Math.round(fontSize * 0.6)}px`);
    } else {
      this.fontSizeNum.set(8);
      this.fontSize.set('0.5rem');
      this.iconSize.set('0.25rem');
    }
  }
}
