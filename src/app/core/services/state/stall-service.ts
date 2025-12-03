import { inject, Injectable } from '@angular/core';
import { BehaviorSubject, filter, forkJoin, map, switchMap, take, tap } from 'rxjs';
import { StallData } from 'src/app/core/interfaces/stall.interface';
import { PromoApiService } from '../api/promo-api.service';
import { PromoStall } from '../../interfaces/promo-stall.interface';
import { StallApiService } from '../api/stall-api.service';
import { StallDto } from '../../models/stall.model';
import { fetchExcelData } from 'src/app/utils/google-excel-data-loader';
import {
  StallGroupRule,
  StallGridDef,
  StallRule,
  StallRuleDirectionType,
  BookmarkPosType,
} from '../../interfaces/stall-def.interface';
import { ExpoStateService } from './expo-state-service';

@Injectable({
  providedIn: 'root',
})
export class StallService {
  private _allStalls = new BehaviorSubject<StallData[]>([]);
  private _allOrigStalls = new BehaviorSubject<StallDto[]>([]);
  private _fetchEnd = new BehaviorSubject<boolean>(false);
  private _stallUpdatedAt = new BehaviorSubject<number>(-1);
  private _stallZoneDef = new BehaviorSubject<Map<string, StallGridDef>>(new Map());

  private _stallApiService = inject(StallApiService);
  private _promoService = inject(PromoApiService);
  private _expoStateService = inject(ExpoStateService);

  private _validStallIds = new Set<string>();

  // This set contains rows that are *permanently* grouped on all screen sizes.
  permanentlyGroupedRowIds = new Set();
  groupDef = new Map<string, StallGroupRule>();

  allStalls$ = this._allStalls.asObservable();
  fetchEnd$ = this._fetchEnd.asObservable();
  stallUpdatedAt$ = this._stallUpdatedAt.asObservable();
  stallZoneDef$ = this._stallZoneDef.asObservable();

  constructor() {
    forkJoin([
      this._stallApiService.fetch().pipe(),
      this._expoStateService.stallGridDef$.pipe(
        filter((url) => !!url),
        take(1),
        switchMap((url) => fetchExcelData(url)),
      ),
      this._expoStateService.stallZoneDef$.pipe(
        filter((url) => !!url),
        take(1),
        switchMap((url) => fetchExcelData(url)),
      ),
    ])
      .pipe()
      .subscribe(([rawStallData, gridDefs, zoneDefs]) => {
        this._processDefs(gridDefs, zoneDefs);
        const stalls = this._processStalls(rawStallData);
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

  get fetchEnd() {
    return this._fetchEnd.getValue();
  }

  findStall(id: string): StallData | undefined {
    return this._allStalls.getValue().find((stall) => stall.id === id);
  }

  updateStall(stallId: string, data: StallDto) {
    const stall = this.findStall(stallId);
    if (stall) {
      stall.stallTitle = data.stallTitle;
      stall.stallImg = data.stallImg;
      stall.stallLink = data.stallLink;

      const promos: PromoStall[] = data.promotion.map((dto) => {
        return this._promoService.transformDtoToPromo(dto);
      });
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

  isGroupedMember(stall: StallData) {
    // Stalls that are members of a permanently grouped row are hidden on the main map (on all screen sizes).
    const rowId = stall.stallZone;
    return this.permanentlyGroupedRowIds.has(rowId);
  }

  private _processDefs(
    stallDefRawData: Record<string, string>[],
    zoneDefRawData: Record<string, string>[],
  ) {
    const permanentlyGroupedRowIds = new Set<string>();
    const groups = new Map<string, StallGroupRule>();
    zoneDefRawData.forEach((group) => {
      const zoneId = group['zone_id'];
      const zoneSort = Number(group['zone_sort']);
      const isGrouped = Boolean(group['is_grouped']);
      const defaultGroupStallId = group['default_group_stall_id'];
      const skipStart = Number(group['skip_start']);
      const skipEnd = Number(group['skip_end']);
      const top = Number(group['bounding_box_top']);
      const left = Number(group['bounding_box_left']);
      const bottom = Number(group['bounding_box_bottom']);
      const right = Number(group['bounding_box_right']);
      const g: StallGroupRule = {
        zoneSort,
        isGrouped,
        defaultStallId: defaultGroupStallId,
        skipStart,
        skipEnd,
        boundingBox: {
          top,
          left,
          bottom,
          right,
        },
      };
      groups.set(zoneId, g);
      if (isGrouped) {
        permanentlyGroupedRowIds.add(zoneId);
      }
    });

    const stallZoneDefs = new Map<string, StallGridDef>();
    stallDefRawData.forEach((rawSeries) => {
      const zoneId = rawSeries['zone_id'];
      const start = Number(rawSeries['anchor_stall_start']);
      const end = Number(rawSeries['anchor_stall_end']);
      const blockStallCnt = Number(rawSeries['block_stall_cnt']);
      const blockGap = Number(rawSeries['block_gap']);
      const direction = rawSeries['direction'];
      const width = Number(rawSeries['stall_width']);
      const height = Number(rawSeries['stall_height']);
      const top = Number(rawSeries['anchor_stall_rect_top']);
      const left = Number(rawSeries['anchor_stall_rect_left']);
      const bookmarkPosition = rawSeries['bookmark_position'];
      const zoneColor = rawSeries['zone_color'];
      const fontColor = rawSeries['font_color'];

      let entry = stallZoneDefs.get(zoneId);
      if (!entry) {
        const group = groups.get(zoneId);
        if (!group) {
          console.error(`defs 缺少區域${zoneId} 的 group 定義`);
          return;
        }
        const def: StallGridDef = {
          zoneId,
          isGrouped: group.isGrouped,
          stallDefs: [],
          groupDef: group,
          bookmarkPosition: bookmarkPosition as BookmarkPosType,
        };
        entry = def;
        stallZoneDefs.set(zoneId, def);
      }

      const stallRule: StallRule = {
        start,
        end,
        blockStallCnt,
        blockGap,
        width,
        height,
        anchorRect: {
          top,
          left,
        },
        direction: direction as StallRuleDirectionType,
        bookmarkPosition: bookmarkPosition as BookmarkPosType,
        zoneColor,
        fontColor,
      };
      entry.stallDefs.push(stallRule);
    });

    this.permanentlyGroupedRowIds = permanentlyGroupedRowIds;
    this._stallZoneDef.next(stallZoneDefs);
    this.groupDef = groups;
  }

  /**
   * Processes raw data from the sheet into the application's StallData format.
   * This function groups multiple promotion rows (with the same ID) into one stall object
   * and calculates the coordinates for each stall's interactive area on the map.
   * @param rawData Array of objects parsed from CSV.
   * @returns An array of fully processed StallData objects.
   */
  private _processStalls(rawData: StallDto[]): StallData[] {
    // Convert the stallGridRefs array into a Map for efficient O(1) lookups by stall letter.
    const stallZoneDef = this._stallZoneDef.getValue();

    // Use a Map to group all data by stall ID. This allows us to merge multiple rows
    // (e.g., one for official data, multiple for promo data) into a single object.
    const stallsMap = new Map<string, StallData>();

    rawData.forEach((rawStall) => {
      const id = rawStall.id;
      if (!id) return; // Skip rows without an ID, as they can't be processed.

      let stallEntry = stallsMap.get(id);

      // If this is the first time we see this stall ID, create the base StallData object.
      if (!stallEntry) {
        const stallZone = rawStall.stallZone;
        const stallNum = rawStall.stallNum;
        const padNum = stallNum.toString().padStart(2, '0');
        const stallCnt = rawStall.stallCnt; // How many table spaces the stall occupies.
        const locateStall = stallZoneDef.get(stallZone); // Get the template coordinates for this row/column.

        // If we can't find a template or the number is invalid, we can't calculate a position.
        if (!locateStall || isNaN(stallNum)) {
          console.warn(
            `Could not find defination for stall ID: ${id}. Skipping base creation. ${stallZone}, ${locateStall}, ${stallNum}`,
          );
          return;
        }

        // --- Coordinate Calculation ---
        const stallDef = locateStall.stallDefs.find((def) => {
          return stallNum >= def.start && stallNum <= def.end;
        });
        if (!stallDef) {
          console.warn(
            `Could not calculate position for stall ID: ${id}. Skipping base creation. ${stallZone}, ${locateStall}, ${stallNum}`,
          );
          return;
        }
        const defTop = stallDef.anchorRect.top;
        const defLeft = stallDef.anchorRect.left;
        let top = defTop;
        let left = defLeft;
        const start = stallDef.start;
        const end = stallDef.end;
        const width = stallDef.width;
        const height = stallDef.height;
        const direction = stallDef.direction;
        const blockGap = stallDef.blockGap;
        const blockStallCnt = stallDef.blockStallCnt;
        let myCoords: NonNullable<StallData['coords']>;

        // Most stalls are in horizontal rows, calculate position from right to left.
        let skipStallNum = stallNum - start;
        const currBlockGap = blockGap * Math.floor((stallNum - start) / blockStallCnt);

        let stallWidth = width;
        let stallHeight = height;
        switch (direction) {
          case 'right':
            left = left - skipStallNum * width - currBlockGap;
            if (stallCnt > 1) {
              left -= (stallCnt - 1) * width;
            }
            stallWidth = width * stallCnt;
            break;
          case 'left':
            left = left + skipStallNum * width + currBlockGap;
            stallWidth = width * stallCnt;
            break;
          case 'top':
            top = top + skipStallNum * height + currBlockGap;
            stallHeight = height * stallCnt;
            break;
          case 'bottom':
            top = top - skipStallNum * height - currBlockGap;
            if (stallCnt > 1) {
              top -= (stallCnt - 1) * height;
            }
            stallHeight = height * stallCnt;
            break;
        }

        // 設定 group 的 stall 位置為 group 的中心
        const zoneDef = locateStall.groupDef;
        const isGrouped = zoneDef.isGrouped;
        const skipStart = zoneDef.skipStart;
        const skipEnd = zoneDef.skipEnd;
        if (isGrouped) {
          const num = (end - start - (skipEnd - skipStart) + 1) / 2;
          switch (direction) {
            case 'right':
              left = defLeft - num * width - currBlockGap;
              stallWidth = width * stallCnt;
              break;
            case 'left':
              left = defLeft + num * width + currBlockGap;
              stallWidth = width * stallCnt;
              break;
            case 'top':
              top = defTop + num * height + currBlockGap;
              stallHeight = height * stallCnt;
              break;
            case 'bottom':
              top = defTop - num * height - currBlockGap;
              stallHeight = height * stallCnt;
              break;
          }
        }

        const finalLeft = parseFloat(left.toFixed(2));
        const finalTop = parseFloat(top.toFixed(2));

        myCoords = {
          top: finalTop,
          left: finalLeft,
          width: stallWidth,
          height: stallHeight,
        };

        // Create the new entry in the map.
        let stallImg = rawStall['stallImg'] || undefined;
        if (stallImg && stallImg.startsWith('assets/2025/')) {
          stallImg = `https://cdn.jsdelivr.net/gh/v4724/nice-0816@d24cd07/${stallImg}`;
        }
        const promoData = rawStall.promotion.map((data) => {
          return this._promoService.transformDtoToPromo(data);
        });
        const stall = {
          id: id,
          stallZone,
          stallNum,
          padNum,
          stallCnt: stallCnt,
          stallTitle: rawStall['stallTitle'] || 'N/A',
          stallImg: stallImg,
          stallLink: rawStall['stallLink'] || undefined,
          coords: myCoords,
          promoData: promoData || [],
          hasPromo: !!(promoData || []).length,
          filterSeries: [],
          filterTags: [],
          filterCustomTags: [],
          isSearchMatch: false,
          rule: stallDef,
        };
        stallsMap.set(id, stall);
        stallEntry = stall;
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
