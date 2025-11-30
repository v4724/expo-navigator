import { inject, Injectable } from '@angular/core';
import { BehaviorSubject, filter, forkJoin } from 'rxjs';
import { fetchExcelData } from 'src/app/utils/google-excel-data-loader';
import { AreaDto } from '../../models/area.model';
import { Area } from '../../interfaces/area.interface';
import { ExpoStateService } from './expo-state-service';

@Injectable({
  providedIn: 'root',
})
export class AreaService {
  private _allAreas = new Map<string, AreaDto>();

  private _selectedAreaId = new BehaviorSubject<Set<string>>(new Set());
  private _fetchEnd = new BehaviorSubject<boolean>(false);
  private _show = new BehaviorSubject<boolean>(false);

  selectedAreasId$ = this._selectedAreaId.asObservable();
  fetchEnd$ = this._fetchEnd.asObservable();

  show$ = this._show.asObservable();

  private _expoStateService = inject(ExpoStateService);

  constructor() {
    this._expoStateService.areaCSVUrl$.pipe(filter((url) => !!url)).subscribe((url) => {
      forkJoin([fetchExcelData(url)])
        .pipe()
        .subscribe(([area]) => {
          this._processAreas(area);
          this._selectAll();
          this._fetchEnd.next(true);
        });
    });
  }

  get allAreas(): AreaDto[] {
    return Array.from(this._allAreas.values());
  }

  get selectedAreaId() {
    return this._selectedAreaId.getValue();
  }

  toggleLayer() {
    this._show.next(!this._show.getValue());
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

  _selectAll() {
    const set = new Set(Array.from(this._allAreas.keys()));
    this._selectedAreaId.next(set);
  }
}
