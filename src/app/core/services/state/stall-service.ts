import { Injectable } from '@angular/core';
import { BehaviorSubject, forkJoin } from 'rxjs';
import { StallDto } from '../../interfaces/stall-dto.interface';
import { StallData } from 'src/app/components/stall/stall.interface';
import { stallGridRefs } from '../../const/official-data';
import { fetchExcelData } from 'src/app/utils/google-excel-data-loader';
import { PROMOTION_CSV_URL, STALL_CSV_URL } from '../../const/google-excel-csv-url';
import { processStalls } from 'src/app/ts/stall-processor';

@Injectable({
  providedIn: 'root',
})
export class StallService {
  private _allStalls = new BehaviorSubject<StallData[]>([]);
  private _allOrigStalls = new BehaviorSubject<StallDto[]>([]);
  private _fetchEnd = new BehaviorSubject<boolean>(false);

  // This set contains rows that are *permanently* grouped on all screen sizes.
  permanentlyGroupedRowIds = new Set(
    stallGridRefs.filter((r) => r.isGrouped).map((r) => r.groupId),
  );

  allStalls$ = this._allStalls.asObservable();
  fetchEnd$ = this._fetchEnd.asObservable();

  constructor() {
    forkJoin([fetchExcelData(STALL_CSV_URL), fetchExcelData(PROMOTION_CSV_URL)])
      .pipe()
      .subscribe(([rawStallData, rawPromoData]) => {
        const stalls = processStalls(rawStallData, rawPromoData);
        this._allStalls.next(stalls);
        this._fetchEnd.next(true);
      });
  }

  get allStalls() {
    return this._allStalls.getValue();
  }

  findStall(id: string): StallData | undefined {
    return this._allStalls.getValue().find((stall) => stall.id === id);
  }

  isGroupedMember(stallId: string) {
    // Stalls that are members of a permanently grouped row are hidden on the main map (on all screen sizes).
    const rowId = stallId.substring(0, 1);
    return this.permanentlyGroupedRowIds.has(rowId);
  }
}
