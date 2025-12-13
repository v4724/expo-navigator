import { inject, Injectable } from '@angular/core';
import { BehaviorSubject, filter, Subject } from 'rxjs';
import { MarkedListDto, MarkedListUpdateDto } from '../../models/marked-stall.model';
import { StallService } from './stall-service';
import { MarkedList } from '../../interfaces/marked-stall.interface';
import { UserService } from './user-service';

@Injectable({
  providedIn: 'root',
})
export class MarkedStallService {
  private _origData: MarkedListDto[] = [];
  private _markedIds = new Set<string>();

  private _quickMapByListId = new Map<number, MarkedList>();

  // sorted
  private _markedList = new BehaviorSubject<MarkedList[]>([]);
  private _fetchEnd = new BehaviorSubject<boolean>(false);
  private _show = new BehaviorSubject<boolean>(true);

  // 快速查詢用 攤位有沒有被加在清單上 <stallId, Set<listId>>
  private _markedMapByStallId = new BehaviorSubject<Map<string, Set<number>>>(new Map());

  private _toggleList = new Subject<MarkedList>();

  fetchEnd$ = this._fetchEnd.asObservable();
  markedList$ = this._markedList.asObservable();
  markedMapByStallId$ = this._markedMapByStallId.asObservable();

  layerShown$ = this._show.asObservable();
  toggleList$ = this._toggleList.asObservable();

  private _stallService = inject(StallService);

  constructor() {
    this.markedList$.subscribe(() => {
      this._updateInnerMap();
    });
  }

  initAfterLogin(dto: MarkedListDto[]) {
    if (this._stallService.fetchEnd) {
      this._processMarkedList(dto);
    } else {
      this._stallService.fetchEnd$.pipe(filter((val) => !!val)).subscribe(() => {
        this._processMarkedList(dto);
      });
    }
    this._fetchEnd.next(true);
  }

  get allList(): MarkedList[] {
    return this._markedList.getValue();
  }

  set allList(data: MarkedList[]) {
    this._markedList.next(data);
  }

  isMarked(stallId: string): boolean {
    const size = this._markedMapByStallId.getValue().get(stallId)?.size;
    if (size) {
      return size > 0;
    }
    return false;
  }

  toggleLayer() {
    this._show.next(!this._show.getValue());
  }

  toggleList(list: MarkedList) {
    this._toggleList.next(list);
  }

  add(data: MarkedListDto) {
    this.allList = [...this.allList, this.dtoToMarkedList(data)];

    this._updateInnerMap();
  }

  update(data: MarkedListUpdateDto) {
    const id = data.id;
    const orig = this._quickMapByListId.get(id);
    if (orig) {
      orig.listName = data.listName;
      orig.icon = data.icon;
      orig.iconColor = data.iconColor;
      orig.list = data.list
        .map((stallId) => {
          const find = this._stallService.findStall(stallId);
          if (find) {
            return find;
          }
          return null;
        })
        .filter((item) => !!item);

      this._updateInnerMap();
    }
  }

  delete(id: number) {
    const find = this.allList.find((list) => list.id === id);
    if (find) {
      const findIndex = this.allList.indexOf(find);
      this.allList.splice(findIndex, 1);
    }
    this.allList = [...this.allList];

    this._updateInnerMap();
  }

  private _processMarkedList(dtoData: MarkedListDto[]) {
    const data: MarkedList[] = dtoData
      .map((dto) => {
        return this.dtoToMarkedList(dto);
      })
      .filter((item) => !!item);

    this._origData = dtoData;
    this._markedList.next(data);
  }

  private _updateInnerMap() {
    const allList = this.allList;
    const markedMapByStallId = new Map<string, Set<number>>();
    const quickMapByListId = new Map<number, MarkedList>();

    allList.forEach((item: MarkedList) => {
      const listId = item.id;
      item.list.forEach((stall) => {
        let markEntry: Set<number> | undefined = markedMapByStallId.get(stall.id);
        if (!markEntry) {
          markEntry = new Set();
          markedMapByStallId.set(stall.id, markEntry);
        }
        markEntry.add(listId);
      });

      quickMapByListId.set(listId, item);
    });

    this._quickMapByListId = quickMapByListId;
    this._markedMapByStallId.next(markedMapByStallId);
  }

  dtoToMarkedList(dto: MarkedListDto): MarkedList {
    const list = dto.list
      .map((stallId) => {
        const stallInfo = this._stallService.findStall(stallId);
        if (stallInfo) {
          return stallInfo;
        }
        return null;
      })
      .filter((stall) => !!stall);

    return {
      ...dto,
      list,
      show: true,
      isUpdating: false,
    };
  }
}
