import { Injectable } from '@angular/core';
import { BehaviorSubject, forkJoin } from 'rxjs';
import { fetchExcelData } from 'src/app/utils/google-excel-data-loader';
import { AREA_CSV_URL } from '../../const/google-excel-csv-url';
import { AreaDto } from '../../models/area.model';
import { Area } from '../../interfaces/area.interface';

@Injectable({
  providedIn: 'root',
})
export class AreaService {
  private _allAreas = new Map<string, AreaDto>();

  private _selectedAreaId = new BehaviorSubject<Set<string>>(new Set());
  private _fetchEnd = new BehaviorSubject<boolean>(false);

  selectedAreasId$ = this._selectedAreaId.asObservable();
  fetchEnd$ = this._fetchEnd.asObservable();

  constructor() {
    forkJoin([fetchExcelData(AREA_CSV_URL)])
      .pipe()
      .subscribe(([area]) => {
        this._processAreas(area);
        this._fetchEnd.next(true);
      });
  }

  get allAreas(): AreaDto[] {
    return Array.from(this._allAreas.values());
  }

  get selectedAreaId() {
    return this._selectedAreaId.getValue();
  }

  toggleArea(id: string) {
    const newCats = new Set(this.selectedAreaId);
    if (newCats.has(id)) {
      newCats.delete(id);
    } else {
      newCats.add(id);
    }
    this._selectedAreaId.next(newCats);
  }

  toAreas(mapW: number, mapH: number): Area[] {
    const data: Area[] = [];
    this._allAreas.forEach((areaDto, key) => {
      const area = this.toArea(mapW, mapH, key);
      if (area) {
        data.push(area);
      }
    });
    return data;
  }

  toArea(mapW: number, mapH: number, id: string): Area | undefined {
    const areaDto = this._allAreas.get(id);
    if (!areaDto) return areaDto;

    const areaPoints = JSON.parse(areaDto.areaPoints);
    const polygonPoints = areaPoints
      .map((p: any) => {
        return `${(p.x * mapW) / 100},${(p.y * mapH) / 100}`;
      })
      .join(' ');

    const area = {
      id,
      name: areaDto.areaName,
      areaPoints: areaPoints,
      polygonPoints,
      fillColor: areaDto.fillColor,
      textPointX: (Number(areaDto.textPointX) * mapW) / 100,
      textPointY: (Number(areaDto.textPointY) * mapH) / 100,
      textColor: areaDto.textColor,
    };

    return area;
  }

  private _processAreas(rawData: Record<string, string>[]) {
    rawData.forEach((rawSeries) => {
      const areaId = rawSeries['areaId'];
      const areaName = rawSeries['areaName'];
      const areaPoints = rawSeries['areaPoints'];
      const fillColor = rawSeries['fillColor'];
      const textPointX = rawSeries['textPointX'];
      const textPointY = rawSeries['textPointY'];
      const textColor = rawSeries['textColor'];

      if (!areaPoints) return;

      if (!this._allAreas.has(areaId)) {
        const area: AreaDto = {
          areaId,
          areaName,
          areaPoints,
          fillColor,
          textPointX,
          textPointY,
          textColor,
        };
        this._allAreas.set(areaId, area);
      }
    });
  }
}
