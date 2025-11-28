import { CommonModule } from '@angular/common';
import { Component, computed, inject, input, OnInit, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { MatIcon } from '@angular/material/icon';
import { filter, map } from 'rxjs';
import { StallGridDef } from 'src/app/core/interfaces/stall-def.interface';
import { MarkedStallService } from 'src/app/core/services/state/marked-stall-service';
import { StallMapService } from 'src/app/core/services/state/stall-map-service';
import { StallService } from 'src/app/core/services/state/stall-service';
import { UserService } from 'src/app/core/services/state/user-service';

@Component({
  selector: 'app-bookmarks',
  imports: [CommonModule, MatIcon],
  templateUrl: './bookmarks.html',
  styleUrl: './bookmarks.scss',
})
export class Bookmarks implements OnInit {
  zoneId = input.required<string>();

  private _stallService = inject(StallService);
  private _markedListService = inject(MarkedStallService);
  private _stallMapService = inject(StallMapService);
  private _userService = inject(UserService);

  isLogin = toSignal(this._userService.isLogin$);
  showMarkLayer = toSignal(this._markedListService.layerShown$);
  allMarkedList = toSignal(this._markedListService.markedList$);
  toggleListStamp = toSignal(
    this._markedListService.toggleList$.pipe(
      map(() => {
        return +new Date();
      }),
    ),
  );
  zoneDef = toSignal(this._stallService.stallZoneDef$);

  isGroupedMember = computed(() => {
    const def = this.def();
    if (!def) return false;
    return def.groupDef.isGrouped;
  });

  def = computed(() => {
    const zoneDef = this.zoneDef();
    if (!zoneDef || !this.zoneId) return null;

    const def = zoneDef.get(this.zoneId());

    return def;
  });

  // 該 zoneId 所有攤位的書籤列表在 distinct 後的書籤圖案
  distinctBookmarks = computed(() => {
    const all = this.allMarkedList();
    const toggleListStamp = this.toggleListStamp(); // 聽一下當有單一書籤圖層開啟或關閉
    const list = all?.filter((list) => {
      return (
        list.show &&
        list.list.some((stall) => {
          return stall.stallZone === this.zoneId();
        })
      );
    });
    return list;
  });

  fontSizeNum = signal<number>(8);
  fontSize = signal<string>('0.5rem');
  iconSize = signal<string>('0.25rem');

  ngOnInit(): void {
    this._stallService.fetchEnd$.pipe(filter((val) => !!val)).subscribe(() => {
      const def = this.def();
      if (def) {
        this.setIconSize(def);
      }
    });
  }

  setIconSize(def: StallGridDef) {
    const mapH = this._stallMapService.mapContentWH.h;
    if (mapH) {
      const h = (Number(def.stallDefs[0].height) * mapH) / 100;
      const fontSize = h;
      this.fontSize.set(`${Math.round(fontSize)}px`);
      this.iconSize.set(`${Math.round(fontSize * 0.6)}px`);
    } else {
      this.fontSize.set('0.5rem');
      this.iconSize.set('0.25rem');
    }
  }
}
