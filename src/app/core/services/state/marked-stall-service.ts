import { inject, Injectable } from '@angular/core';
import { BehaviorSubject, first, forkJoin } from 'rxjs';
import { fetchExcelData } from 'src/app/utils/google-excel-data-loader';
import { MARKED_STALL_CSV_URL } from '../../const/google-excel-csv-url';
import { MarkedStallDto } from '../../models/marked-stall.model';
import { StallService } from './stall-service';
import { MarkedStall } from '../../interfaces/marked-stall.interface';
import { UserService } from './user-service';

@Injectable({
  providedIn: 'root',
})
export class MarkedStallService {
  private _origData: MarkedStallDto[] = [];
  private _markedIds = new Set<string>();

  // sorted
  private _sortedMarkedStalls = new BehaviorSubject<MarkedStall[]>([]);
  private _fetchEnd = new BehaviorSubject<boolean>(false);
  private _show = new BehaviorSubject<boolean>(false);

  sortedMarkedStalls$ = this._sortedMarkedStalls.asObservable();
  fetchEnd$ = this._fetchEnd.asObservable();
  show$ = this._show.asObservable();

  private _stallService = inject(StallService);
  private _userService = inject(UserService);

  constructor() {
    // TODO
    this._userService.user$.pipe().subscribe((user) => {
      const userId = user?.acc;
      const marked = [];
    });

    forkJoin([
      fetchExcelData(MARKED_STALL_CSV_URL),
      this._stallService.fetchEnd$.pipe(first((val) => !!val)),
    ])
      .pipe()
      .subscribe(([rawData]) => {
        this._processMarkedStall(rawData);
        this._updateSet();
        this._fetchEnd.next(true);
      });
  }

  get markedStalls(): MarkedStall[] {
    return this._sortedMarkedStalls.getValue();
  }

  set markedStalls(data: MarkedStall[]) {
    this._sortedMarkedStalls.next(data);
  }

  isMarked(stallId: string): boolean {
    return this._markedIds.has(stallId);
  }

  toggleLayer() {
    this._show.next(!this._show.getValue());
  }

  update(stallId: string, marked: boolean) {
    if (marked) {
      const newCat = [...this.markedStalls];
      const stall = this._stallService.findStall(stallId);
      if (stall) {
        newCat.push({ info: stall, stallId, sortedNum: newCat[newCat.length - 1].sortedNum + 1 });

        this._markedIds.add(stallId);
        this.markedStalls = newCat;
      }
    } else {
      this._markedIds.delete(stallId);

      const newCat = [...this.markedStalls];
      const find = newCat.find((stall) => stall.stallId === stallId);
      if (find) {
        const index = newCat.indexOf(find);
        newCat.splice(index, 1);
        this.markedStalls = newCat;
      }
    }
  }

  private _processMarkedStall(rawData: Record<string, string>[]) {
    const dtoData: MarkedStallDto[] = [];
    const data: MarkedStall[] = [];
    rawData.forEach((rawSeries) => {
      const stallId = rawSeries['stallId'];
      const sortedNum = rawSeries['sortedNum'];

      const dto: MarkedStallDto = {
        stallId,
        sortedNum: Number(sortedNum),
      };
      const markedStall = this.toMarkedStall(dto);

      dtoData.push(dto);
      markedStall && data.push(markedStall);
    });

    data.sort((a, b) => {
      return a.sortedNum - b.sortedNum;
    });

    this._origData = dtoData;
    this._sortedMarkedStalls.next(data);
  }

  private _updateSet() {
    this._markedIds = new Set(this.markedStalls.map((stall) => stall.stallId));
  }

  toMarkedStall(data: MarkedStallDto): MarkedStall | null {
    const stallInfo = this._stallService.findStall(data.stallId);

    if (stallInfo) {
      return {
        ...data,
        info: stallInfo,
      };
    }
    return null;
  }
}
