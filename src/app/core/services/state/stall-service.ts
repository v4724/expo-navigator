import { inject, Injectable } from '@angular/core';
import { BehaviorSubject, forkJoin } from 'rxjs';
import { StallDto } from '../../interfaces/stall-dto.interface';
import { StallData } from 'src/app/components/stall/stall.interface';
import { stallGridRefs } from '../../const/official-data';
import { fetchExcelData } from 'src/app/utils/google-excel-data-loader';
import { PROMOTION_CSV_URL, STALL_CSV_URL } from '../../const/google-excel-csv-url';
import { PromoApiService } from '../api/promo-api.service';
import { PromoStall } from '../../interfaces/promo-stall.interface';
import { PromoStallDto } from '../../models/promo-stall.model';

@Injectable({
  providedIn: 'root',
})
export class StallService {
  private _allStalls = new BehaviorSubject<StallData[]>([]);
  private _allOrigStalls = new BehaviorSubject<StallDto[]>([]);
  private _fetchEnd = new BehaviorSubject<boolean>(false);
  private _stallUpdatedAt = new BehaviorSubject<number>(-1);

  private _promoService = inject(PromoApiService);

  private _validStallIds = new Set<string>();

  // This set contains rows that are *permanently* grouped on all screen sizes.
  permanentlyGroupedRowIds = new Set(
    stallGridRefs.filter((r) => r.isGrouped).map((r) => r.groupId),
  );

  allStalls$ = this._allStalls.asObservable();
  fetchEnd$ = this._fetchEnd.asObservable();
  stallUpdatedAt$ = this._stallUpdatedAt.asObservable();

  constructor() {
    forkJoin([fetchExcelData(STALL_CSV_URL), this._promoService.getPromotions()])
      .pipe()
      .subscribe(([rawStallData, rawPromoData]) => {
        const stalls = this._processStalls(rawStallData, rawPromoData);
        this._allStalls.next(stalls);
        this._fetchEnd.next(true);
      });

    this.allStalls$.subscribe((stalls) => {
      this._validStallIds = new Set(stalls.map((s) => s.id));
    });
  }

  get allStalls() {
    return this._allStalls.getValue();
  }

  get allStallIds() {
    return this._validStallIds;
  }

  findStall(id: string): StallData | undefined {
    return this._allStalls.getValue().find((stall) => stall.id === id);
  }

  updateStallInfo(stallId: string, data: StallData) {}
  updateStallPromos(stallId: string, data: PromoStallDto[]) {
    const promos: PromoStall[] = data.map((dto) => {
      return this._promoService.transformDtoToPromo(dto);
    });
    const stall = this.findStall(stallId);
    if (stall) {
      stall.promoData = promos;
      stall.hasPromo = promos.length > 0;
      this._allStalls.next([...this._allStalls.getValue()]);
      this._updateFilterSet(stall);
    }
    this._stallUpdatedAt.next(+new Date());
  }

  private _updateFilterSet(stall: StallData) {
    const tags = new Set<number>();
    stall.promoData.forEach((promo) => {
      promo.tags.forEach((tag) => tags.add(tag));
    });
    stall.filterTags = Array.from(tags);

    const series = new Set<number>();
    stall.promoData.forEach((promo) => {
      promo.series.forEach((tag) => series.add(tag));
    });
    stall.filterSeries = Array.from(series);

    const customTags = new Set<string>();
    stall.promoData.forEach((promo) => {
      customTags.add(promo.customTags);
    });
    stall.filterCustomTags = Array.from(customTags);
  }

  isGroupedMember(stallId: string) {
    // Stalls that are members of a permanently grouped row are hidden on the main map (on all screen sizes).
    const rowId = stallId.substring(0, 1);
    return this.permanentlyGroupedRowIds.has(rowId);
  }

  /**
   * Processes raw data from the sheet into the application's StallData format.
   * This function groups multiple promotion rows (with the same ID) into one stall object
   * and calculates the coordinates for each stall's interactive area on the map.
   * @param rawData Array of objects parsed from CSV.
   * @returns An array of fully processed StallData objects.
   */
  private _processStalls(
    rawData: Record<string, string>[],
    promoData: PromoStallDto[],
  ): StallData[] {
    // Convert the stallGridRefs array into a Map for efficient O(1) lookups by stall letter.
    const locateStallMap = new Map(stallGridRefs.map((s) => [s.groupId, s]));

    // Use a Map to group all data by stall ID. This allows us to merge multiple rows
    // (e.g., one for official data, multiple for promo data) into a single object.
    const stallsMap = new Map<string, StallData>();

    rawData.forEach((rawStall) => {
      const id = rawStall['id'];
      if (!id) return; // Skip rows without an ID, as they can't be processed.

      let stallEntry = stallsMap.get(id);

      // If this is the first time we see this stall ID, create the base StallData object.
      if (!stallEntry) {
        const line = rawStall['line'];
        const num = parseInt(rawStall['num'], 10);
        const padNum = num.toString().padStart(2, '0');
        const stallCnt = parseInt(rawStall['stallCnt'], 10) || 1; // How many table spaces the stall occupies.
        const locateStall = locateStallMap.get(line); // Get the template coordinates for this row/column.

        // If we can't find a template or the number is invalid, we can't calculate a position.
        if (!locateStall || isNaN(num)) {
          console.warn(`Could not calculate position for stall ID: ${id}. Skipping base creation.`);
          return;
        }

        // --- Coordinate Calculation ---
        const coordsTemplate = locateStall.anchorStallRect;
        let myCoords: NonNullable<StallData['coords']>;
        let myNumericCoords: NonNullable<StallData['numericCoords']>;

        // Most stalls are in horizontal rows, calculate position from right to left.
        if (line !== '狗' && line !== '雞' && line !== '猴' && line !== '特' && line !== '商') {
          const numInBlock = num > 36 ? 72 - num : num;
          // There are visual gaps in the numbering on the map, account for them.
          let gapSize = 0;
          let top = coordsTemplate.top;
          let left = coordsTemplate.left;

          if (num > 24 && num <= 48) {
            gapSize = 1.75;
          } else if (num <= 12 || num >= 61) {
            gapSize = 0;
          } else {
            gapSize = 0.9;
          }
          if (num > 36) {
            top = top - coordsTemplate.height - 0.25;
            left = coordsTemplate.left - (numInBlock % 72) * coordsTemplate.width - gapSize;
          } else {
            left = coordsTemplate.left - (numInBlock - 1) * coordsTemplate.width - gapSize;
            if (stallCnt > 1) {
              left -= (stallCnt - 1) * coordsTemplate.width;
            }
          }

          const finalLeft = parseFloat(left.toFixed(2));
          const finalWidth = coordsTemplate.width * stallCnt;

          myCoords = {
            top: `${top}`,
            left: `${finalLeft}`,
            width: `${finalWidth}`,
            height: `${coordsTemplate.height}`,
          };

          myNumericCoords = {
            top: top,
            left: finalLeft,
            width: finalWidth,
            height: coordsTemplate.height,
          };
        } else {
          // Handle the few vertical columns.
          let tempNum = num;
          let gapSize = 0;
          if (line === '狗') {
            if (num >= 4 && num < 16) {
              tempNum = 3;
              gapSize = 0.8;
            } else if (num >= 16) {
              tempNum = num - 12;
              gapSize = 0.4;
            }
          } else if (line === '雞') {
            if (num >= 4 && num < 21) {
              tempNum = 3;
              gapSize = 0.8;
            } else if (num >= 21) {
              tempNum = num - 17;
              gapSize = 0.4;
            }
          } else if (line === '猴') {
            if (num >= 4 && num < 23) {
              tempNum = 3;
              gapSize = 0.8;
            } else if (num >= 23) {
              tempNum = num - 19;
              gapSize = 0.5;
            }
          } else {
          }
          let top = coordsTemplate.top - coordsTemplate.height * (tempNum - 1) - gapSize;
          if (stallCnt > 1) {
            top -= (stallCnt - 1) * coordsTemplate.height;
          }

          const finalTop = parseFloat(top.toFixed(2));
          const finalHeight = coordsTemplate.height * stallCnt;

          myCoords = {
            top: `${finalTop}`,
            left: `${coordsTemplate.left}`,
            width: `${coordsTemplate.width}`,
            height: `${finalHeight}`,
          };

          myNumericCoords = {
            top: finalTop,
            left: coordsTemplate.left,
            width: coordsTemplate.width,
            height: finalHeight,
          };
        }

        // Create the new entry in the map.
        let stallImg = rawStall['stallImg'] || undefined;
        if (stallImg && stallImg.startsWith('assets/2025/')) {
          stallImg = `https://cdn.jsdelivr.net/gh/v4724/nice-0816@d24cd07/${stallImg}`;
        }
        const stall = {
          id: id,
          num: num,
          padNum,
          stallCnt: stallCnt,
          coords: myCoords,
          numericCoords: myNumericCoords,
          stallTitle: rawStall['stallTitle'] || 'N/A',
          stallImg: stallImg,
          stallLink: rawStall['stallLink'] || undefined,
          promoData: [], // Initialize with an empty array for promotions.
          filterSeries: [],
          filterTags: [],
          filterCustomTags: [],
          hasPromo: false,
          isSearchMatch: false,
        };
        stallsMap.set(id, stall);
        stallEntry = stall;
      }
    });

    promoData.forEach((data: PromoStallDto) => {
      // --- Promotion Data Aggregation ---
      // If the current row contains promotion data, create a PromoStall object
      // and add it to the stall's promoData array.
      const stallId = data.stallId;

      const stallEntry = stallsMap.get(stallId);
      const promo: PromoStall = this._promoService.transformDtoToPromo(data);
      if (stallEntry) {
        stallEntry.promoData.push(promo);
        stallEntry.hasPromo = true;
      }
    });

    // Post-process to collect all unique tags for each stall.
    stallsMap.forEach((stall) => {
      this._updateFilterSet(stall);
    });

    // Convert the Map values back to an array to be used by the application.
    const arr = Array.from(stallsMap.values());
    return arr;
  }
}
