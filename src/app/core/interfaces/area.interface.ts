export interface Area {
  id: string;

  name: string;

  areaPoints: Point[];

  polygonPoints: string;

  fillColor: string;

  // 文字中心位置(百分比*地圖 W or H)
  textPointX: number;

  textPointY: number;

  textColor: string;
}

export interface Point {
  x: string;
  y: string;
}
