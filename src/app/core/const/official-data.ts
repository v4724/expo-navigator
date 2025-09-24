/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { StallGroupGridRef } from '../interfaces/stall-group-grid-ref.interface';

/**
 * Defines the starting coordinates for each row/column of stalls on the map.
 * This data acts as a template or reference point. The `stall-processor.ts` file
 * uses these coordinates along with a stall's specific number (e.g., the "01" in "A01")
 * to calculate its precise position on the map image.
 * The 'border' property defines the bounding box for the entire row.
 */
export const stallGridRefs: StallGroupGridRef[] = [
  {
    groupId: 'A',
    anchorStallNum: 1,
    anchorStallRect: { top: 87.8, left: 91, width: 1.05, height: 1.4 },
    boundingBox: { top: 86.15, left: 52.5, bottom: 89.2, right: 92.05 },
  },
  {
    groupId: 'B',
    anchorStallNum: 1,
    anchorStallRect: { top: 83.1, left: 91, width: 1.05, height: 1.4 },
    boundingBox: { top: 81.45, left: 52.5, bottom: 84.5, right: 92.05 },
  },
  {
    groupId: 'C',
    anchorStallNum: 1,
    anchorStallRect: { top: 78.4, left: 91, width: 1.05, height: 1.4 },
    boundingBox: { top: 76.75, left: 52.5, bottom: 79.8, right: 92.05 },
  },
  {
    groupId: 'D',
    anchorStallNum: 1,
    anchorStallRect: { top: 73.5, left: 91, width: 1.05, height: 1.4 },
    boundingBox: { top: 71.85, left: 52.5, bottom: 74.9, right: 92.05 },
  },
  {
    groupId: 'E',
    anchorStallNum: 1,
    anchorStallRect: { top: 68.5, left: 91, width: 1.05, height: 1.4 },
    boundingBox: { top: 66.85, left: 52.5, bottom: 69.9, right: 92.05 },
  },
  {
    groupId: 'F',
    anchorStallNum: 1,
    anchorStallRect: { top: 63.9, left: 91, width: 1.05, height: 1.4 },
    boundingBox: { top: 62.25, left: 52.5, bottom: 65.3, right: 92.05 },
  },
  {
    groupId: 'G',
    anchorStallNum: 1,
    anchorStallRect: { top: 59.1, left: 91, width: 1.05, height: 1.4 },
    boundingBox: { top: 57.45, left: 52.5, bottom: 60.5, right: 92.05 },
  },
  {
    groupId: 'H',
    anchorStallNum: 1,
    anchorStallRect: { top: 54.3, left: 91, width: 1.05, height: 1.4 },
    boundingBox: { top: 52.65, left: 52.5, bottom: 55.7, right: 92.05 },
  },
  {
    groupId: 'I',
    anchorStallNum: 1,
    anchorStallRect: { top: 49.5, left: 91, width: 1.05, height: 1.4 },
    boundingBox: { top: 47.85, left: 52.5, bottom: 50.9, right: 92.05 },
  },
  {
    groupId: 'J',
    anchorStallNum: 1,
    anchorStallRect: { top: 44.5, left: 91, width: 1.05, height: 1.4 },
    boundingBox: { top: 42.85, left: 52.5, bottom: 45.9, right: 92.05 },
  },
  {
    groupId: 'K',
    anchorStallNum: 1,
    anchorStallRect: { top: 39.6, left: 91, width: 1.05, height: 1.4 },
    boundingBox: { top: 37.95, left: 52.5, bottom: 41.0, right: 92.05 },
  },
  {
    groupId: 'L',
    anchorStallNum: 1,
    anchorStallRect: { top: 34.8, left: 91, width: 1.05, height: 1.4 },
    boundingBox: { top: 33.15, left: 52.5, bottom: 36.2, right: 92.05 },
  },
  {
    groupId: 'M',
    anchorStallNum: 1,
    anchorStallRect: { top: 30.1, left: 91, width: 1.05, height: 1.4 },
    boundingBox: { top: 28.45, left: 52.5, bottom: 31.5, right: 92.05 },
  },
  {
    groupId: 'N',
    anchorStallNum: 1,
    anchorStallRect: { top: 25.2, left: 91, width: 1.05, height: 1.4 },
    boundingBox: { top: 23.55, left: 52.5, bottom: 26.6, right: 92.05 },
  },
  {
    groupId: 'O',
    anchorStallNum: 1,
    anchorStallRect: { top: 20.4, left: 91, width: 1.05, height: 1.4 },
    boundingBox: { top: 18.75, left: 52.5, bottom: 21.8, right: 92.05 },
  },
  {
    groupId: 'P',
    anchorStallNum: 1,
    anchorStallRect: { top: 15.6, left: 91, width: 1.05, height: 1.4 },
    boundingBox: { top: 13.95, left: 52.5, bottom: 17.0, right: 92.05 },
  },
  {
    groupId: 'Q',
    anchorStallNum: 1,
    anchorStallRect: { top: 10.8, left: 91, width: 1.05, height: 1.4 },
    boundingBox: { top: 9.15, left: 52.5, bottom: 12.2, right: 92.05 },
  },
  {
    groupId: 'R',
    anchorStallNum: 1,
    anchorStallRect: { top: 87.8, left: 46.3, width: 1.05, height: 1.4 },
    boundingBox: { top: 86.15, left: 7.8, bottom: 89.2, right: 47.35 },
  },
  {
    groupId: 'S',
    anchorStallNum: 1,
    anchorStallRect: { top: 83.1, left: 46.3, width: 1.05, height: 1.4 },
    boundingBox: { top: 81.45, left: 7.8, bottom: 84.5, right: 47.35 },
  },
  {
    groupId: 'T',
    anchorStallNum: 1,
    anchorStallRect: { top: 78.4, left: 46.3, width: 1.05, height: 1.4 },
    boundingBox: { top: 76.75, left: 7.8, bottom: 79.8, right: 47.35 },
  },
  {
    groupId: 'U',
    anchorStallNum: 1,
    anchorStallRect: { top: 73.5, left: 46.3, width: 1.05, height: 1.4 },
    boundingBox: { top: 71.85, left: 7.8, bottom: 74.9, right: 47.35 },
  },
  {
    groupId: 'V',
    anchorStallNum: 1,
    anchorStallRect: { top: 68.7, left: 46.3, width: 1.05, height: 1.4 },
    boundingBox: { top: 67.05, left: 7.8, bottom: 70.1, right: 47.35 },
  },
  {
    groupId: 'W',
    anchorStallNum: 1,
    anchorStallRect: { top: 63.9, left: 46.3, width: 1.05, height: 1.4 },
    boundingBox: { top: 62.25, left: 7.8, bottom: 65.3, right: 47.35 },
  },
  {
    groupId: 'X',
    anchorStallNum: 1,
    anchorStallRect: { top: 59.1, left: 46.3, width: 1.05, height: 1.4 },
    boundingBox: { top: 57.45, left: 7.8, bottom: 60.5, right: 47.35 },
  },
  {
    groupId: 'Y',
    anchorStallNum: 1,
    anchorStallRect: { top: 54.3, left: 46.3, width: 1.05, height: 1.4 },
    boundingBox: { top: 52.65, left: 7.8, bottom: 55.7, right: 47.35 },
  },
  {
    groupId: 'Z',
    anchorStallNum: 1,
    anchorStallRect: { top: 49.5, left: 46.3, width: 1.05, height: 1.4 },
    boundingBox: { top: 47.85, left: 7.8, bottom: 50.9, right: 47.35 },
  },
  {
    groupId: '鼠',
    anchorStallNum: 1,
    anchorStallRect: { top: 44.5, left: 46.3, width: 1.05, height: 1.4 },
    boundingBox: { top: 42.85, left: 7.8, bottom: 45.9, right: 47.35 },
  },
  {
    groupId: '牛',
    anchorStallNum: 1,
    anchorStallRect: { top: 39.6, left: 46.3, width: 1.05, height: 1.4 },
    boundingBox: { top: 37.95, left: 7.8, bottom: 41.0, right: 47.35 },
  },
  {
    groupId: '虎',
    anchorStallNum: 1,
    anchorStallRect: { top: 34.9, left: 46.3, width: 1.05, height: 1.4 },
    boundingBox: { top: 33.25, left: 7.8, bottom: 36.3, right: 47.35 },
  },
  {
    groupId: '兔',
    anchorStallNum: 1,
    anchorStallRect: { top: 30.1, left: 46.3, width: 1.05, height: 1.4 },
    boundingBox: { top: 28.45, left: 7.8, bottom: 31.5, right: 47.35 },
  },
  {
    groupId: '龍',
    anchorStallNum: 1,
    anchorStallRect: { top: 25.2, left: 46.3, width: 1.05, height: 1.4 },
    boundingBox: { top: 23.55, left: 7.8, bottom: 26.6, right: 47.35 },
  },
  {
    groupId: '蛇',
    anchorStallNum: 1,
    anchorStallRect: { top: 20.4, left: 46.3, width: 1.05, height: 1.4 },
    boundingBox: { top: 18.75, left: 7.8, bottom: 21.8, right: 47.35 },
  },
  {
    groupId: '馬',
    anchorStallNum: 1,
    anchorStallRect: { top: 15.6, left: 46.3, width: 1.05, height: 1.4 },
    boundingBox: { top: 13.95, left: 7.8, bottom: 17.0, right: 47.35 },
  },
  {
    groupId: '羊',
    anchorStallNum: 1,
    anchorStallRect: { top: 10.8, left: 46.3, width: 1.05, height: 1.4 },
    boundingBox: { top: 9.15, left: 7.8, bottom: 12.2, right: 47.35 },
  },
  {
    groupId: '猴',
    anchorStallNum: 1,
    anchorStallRect: { top: 73.5, left: 4.5, width: 1.1, height: 1.44 },
    boundingBox: { top: 52.7, left: 4.5, bottom: 74.9, right: 5.55 },
    isGrouped: true,
  },
  {
    groupId: '雞',
    anchorStallNum: 1,
    anchorStallRect: { top: 43.7, left: 4.5, width: 1.1, height: 1.44 },
    boundingBox: { top: 23, left: 4.5, bottom: 45.6, right: 5.55 },
    isGrouped: true,
    groupDefaultStallId: '雞01雞02',
  },
  {
    groupId: '狗',
    anchorStallNum: 1,
    anchorStallRect: { top: 18.2, left: 4.5, width: 1.1, height: 1.44 },
    boundingBox: { top: 7.5, left: 4.5, bottom: 19.8, right: 5.55 },
    isGrouped: true,
    groupDefaultStallId: '狗01狗02',
  },
  {
    groupId: '特',
    anchorStallNum: 1,
    anchorStallRect: { top: 84.4, left: 4.15, width: 1.8, height: 2.41 },
    boundingBox: { top: 77.15, left: 4.15, bottom: 87.2, right: 5.75 },
    isGrouped: true,
  },
  {
    groupId: '商',
    anchorStallNum: 1,
    anchorStallRect: { top: 89.5, left: 4.15, width: 1.8, height: 2.41 },
    boundingBox: { top: 87.5, left: 4.15, bottom: 91.5, right: 5.75 },
    isGrouped: true,
  },
  {
    groupId: '範',
    anchorStallNum: 1,
    anchorStallRect: { top: 0.5, left: 91, width: 5, height: 5 },
    boundingBox: { top: 0.5, left: 86, bottom: 5.5, right: 96 },
  },
];
