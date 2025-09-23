import { Component, computed, signal } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
interface AdvancedData {
  cp: string[];
  characs: string[];
}

interface TagData {
  category: string;
  advanced?: AdvancedData;
}

// Maps category to its selected advanced filter keys and values
interface AdvancedFilters {
  [category: string]: {
    [key: string]: Set<string>;
  };
}

interface Booth {
  id: string;
  name: string;
  owner: string;
  tags: TagData[];
  x: number;
  y: number;
  width: number;
  height: number;
}

interface Area {
  name: string;
  x: number;
  y: number;
  width: number;
  height: number;
  color: string;
}

@Component({
  selector: 'app-layers-controller',
  imports: [MatIconModule],
  templateUrl: './layers-controller.html',
  styleUrl: './layers-controller.scss',
})
export class LayersController {
  // State Signals
  showControls = signal(true);
  isAreaSectionOpen = signal(true);
  isTagSectionOpen = signal(true);

  // New state for hierarchical tag filtering
  selectedCategories = signal<Set<string>>(new Set());
  selectedAdvancedTags = signal<AdvancedFilters>({});

  activeAreas = signal<Set<string>>(new Set());
  isAdvancedFilterModalOpen = signal(false);
  currentAdvancedFilterCategory = signal<TagData | null>(null);

  // Helpers
  objectKeys = Object.keys;

  // Data
  booths = signal<Booth[]>([
    {
      id: 'A01',
      name: 'Ninja Art',
      owner: 'Rantaro',
      tags: [{ category: '忍亂', advanced: { cp: ['砸一'], characs: ['砸度', '伊作'] } }],
      x: 1,
      y: 1,
      width: 2,
      height: 1,
    },
    {
      id: 'A02',
      name: 'Ninja Scrolls',
      owner: 'Kirio',
      tags: [{ category: '忍亂', advanced: { cp: ['兵傳'], characs: ['黃昏時'] } }],
      x: 3,
      y: 1,
      width: 1,
      height: 1,
    },
    {
      id: 'B01',
      name: 'Karasuno High',
      owner: 'Hinata',
      tags: [
        {
          category: '排球少年',
          advanced: { cp: ['影日', '月山'], characs: ['日向', '月島'] },
        },
      ],
      x: 5,
      y: 2,
      width: 2,
      height: 2,
    },
    {
      id: 'B02',
      name: 'Nekoma Goods',
      owner: 'Kuroo',
      tags: [{ category: '排球少年', advanced: { cp: ['黑月'], characs: ['黑尾'] } }],
      x: 7,
      y: 2,
      width: 1,
      height: 2,
    },
    {
      id: 'C01',
      name: 'VTuber World',
      owner: 'V-Fan',
      tags: [{ category: 'VTuber' }],
      x: 10,
      y: 5,
      width: 3,
      height: 3,
    },
    {
      id: 'C02',
      name: 'Genshin Impact Zone',
      owner: 'Paimon',
      tags: [{ category: '原神' }],
      x: 1,
      y: 8,
      width: 4,
      height: 2,
    },
    {
      id: 'D01',
      name: 'Artbook Central',
      owner: 'Artist Guild',
      tags: [{ category: '畫冊' }],
      x: 15,
      y: 1,
      width: 2,
      height: 2,
    },
    {
      id: 'D02',
      name: 'Doujinshi Alley',
      owner: 'Circle Union',
      tags: [{ category: '同人誌' }],
      x: 15,
      y: 3,
      width: 2,
      height: 3,
    },
  ]);

  areas = signal<Area[]>([
    { name: '忍亂區', x: 1, y: 1, width: 3, height: 1, color: 'rgba(255, 99, 132, 0.5)' },
    { name: '排球少年區', x: 5, y: 2, width: 3, height: 2, color: 'rgba(54, 162, 235, 0.5)' },
  ]);

  tags = signal<TagData[]>([
    {
      category: '忍亂',
      advanced: { cp: ['砸一', '兵傳', '三忍數'], characs: ['砸度', '伊作', '黃昏時'] },
    },
    {
      category: '排球少年',
      advanced: { cp: ['黑月', '月山', '影日'], characs: ['黑尾', '月島', '日向'] },
    },
  ]);

  // Computed Signals
  allTags = computed(() => {
    const tagsMap = new Map<string, TagData>();
    this.booths().forEach((booth) => {
      booth.tags.forEach((tag) => {
        if (!tagsMap.has(tag.category)) {
          tagsMap.set(tag.category, JSON.parse(JSON.stringify(tag))); // Deep copy
        } else {
          // Merge advanced options
          if (tag.advanced) {
            const existingTag = tagsMap.get(tag.category)!;
            if (!existingTag.advanced) {
              existingTag.advanced = { cp: [], characs: [] };
            }
            const existingValues = new Set(existingTag.advanced.cp);
            tag.advanced.cp.forEach((val) => existingValues.add(val));
            existingTag.advanced.cp = Array.from(existingValues).sort();
            const existingValues2 = new Set(existingTag.advanced.characs);
            tag.advanced.characs.forEach((val) => existingValues2.add(val));
            existingTag.advanced.characs = Array.from(existingValues2).sort();
            console.log(existingValues, Array.from(existingValues).sort());
            console.log(existingValues2, Array.from(existingValues2).sort());
          }
        }
      });
    });
    console.log(Array.from(tagsMap.values()));
    return Array.from(tagsMap.values());
  });

  advancedFilterOptions = computed(() => {
    return this.currentAdvancedFilterCategory();
  });

  selectedAdvancedTagsCount = computed(() => {
    const counts: { [category: string]: number } = {};
    const advancedFilters = this.selectedAdvancedTags();
    for (const category in advancedFilters) {
      counts[category] = 0;
      for (const key in advancedFilters[category]) {
        counts[category] += advancedFilters[category][key].size;
      }
    }
    return counts;
  });

  toggleControls() {
    this.showControls.update((v) => !v);
  }
  // expandAll() {
  //   this.isAreaSectionOpen.set(true);
  //   this.isTagSectionOpen.set(true);
  // }
  // collapseAll() {
  //   this.isAreaSectionOpen.set(false);
  //   this.isTagSectionOpen.set(false);
  // }
  toggleAreaSection() {
    this.isAreaSectionOpen.update((v) => !v);
  }
  toggleTagSection() {
    this.isTagSectionOpen.update((v) => !v);
  }
  toggleArea(areaName: string) {
    this.activeAreas.update((areas) => {
      const newAreas = new Set(areas);
      if (newAreas.has(areaName)) {
        newAreas.delete(areaName);
      } else {
        newAreas.add(areaName);
      }
      return newAreas;
    });
  }

  isCategorySelected(category: string): boolean {
    return this.selectedCategories().has(category);
  }

  toggleCategory(category: string) {
    this.selectedCategories.update((cats) => {
      const newCats = new Set(cats);
      if (newCats.has(category)) {
        newCats.delete(category);
      } else {
        newCats.add(category);
      }
      return newCats;
    });
  }

  openAdvancedFilterModal(tag: TagData) {
    if (!tag.advanced) return;
    this.currentAdvancedFilterCategory.set(tag);
    this.isAdvancedFilterModalOpen.set(true);
  }

  closeAdvancedFilterModal() {
    this.isAdvancedFilterModalOpen.set(false);
    this.currentAdvancedFilterCategory.set(null);
  }

  isAdvancedTagSelected(category: string, key: string, value: string): boolean {
    return this.selectedAdvancedTags()[category]?.[key]?.has(value) ?? false;
  }

  toggleAdvancedTag(category: string, key: string, value: string) {
    this.selectedAdvancedTags.update((filters) => {
      const newFilters = { ...filters };
      if (!newFilters[category]) newFilters[category] = {};
      if (!newFilters[category][key]) newFilters[category][key] = new Set();

      if (newFilters[category][key].has(value)) {
        newFilters[category][key].delete(value);
      } else {
        newFilters[category][key].add(value);
      }
      return newFilters;
    });
  }
}
