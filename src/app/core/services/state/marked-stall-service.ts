import { inject, Injectable } from '@angular/core';
import { BehaviorSubject, Subject } from 'rxjs';
import { MarkedListDto } from '../../models/marked-stall.model';
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
  private _show = new BehaviorSubject<boolean>(false);

  // 快速查詢 攤位有沒有被加在清單上 <stallId, Set<listId>>
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
    this._processMarkedList(dto);
    this._fetchEnd.next(true);
  }

  get allList(): MarkedList[] {
    return this._markedList.getValue();
  }

  set allList(data: MarkedList[]) {
    this._markedList.next(data);
  }

  isMarked(stallId: string): boolean {
    return Array.from(this._markedMapByStallId.getValue().get(stallId) ?? [])
      .map((listId: number) => {
        return !!this._quickMapByListId.get(listId)?.show;
      })
      .some((shown) => !!shown);
  }

  toggleLayer() {
    this._show.next(!this._show.getValue());
  }

  toggleList(list: MarkedList) {
    this._toggleList.next(list);
  }

  update(stallId: string, marked: boolean) {
    // TODO
    // if (marked) {
    //   const newCat = [...this.allList];
    //   const stall = this._stallService.findStall(stallId);
    //   if (stall) {
    //     newCat.push({ info: stall, stallId, sortedNum: newCat[newCat.length - 1].sortedNum + 1 });
    //     this._markedIds.add(stallId);
    //     this.allList = newCat;
    //   }
    // } else {
    //   this._markedIds.delete(stallId);
    //   const newCat = [...this.allList];
    //   const find = newCat.find((stall) => stall.stallId === stallId);
    //   if (find) {
    //     const index = newCat.indexOf(find);
    //     newCat.splice(index, 1);
    //     this.allList = newCat;
    //   }
    // }
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
        let markEntry: Set<number> | undefined = markedMapByStallId.get(stall.stallId);
        if (!markEntry) {
          markEntry = new Set();
          markedMapByStallId.set(stall.stallId, markEntry);
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
          return {
            stallId,
            stallInfo,
          };
        }
        return null;
      })
      .filter((stall) => !!stall);

    return {
      ...dto,
      list,
      show: true,
    };
  }
}
