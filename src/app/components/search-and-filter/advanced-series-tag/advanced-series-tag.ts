import { CommonModule } from '@angular/common';
import { Component, computed, inject, input, signal } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { StallSeries } from 'src/app/core/interfaces/stall-series-tag.interface';
import { TagService } from 'src/app/core/services/state/tag-service';

@Component({
  selector: 'app-advanced-series-tag',
  imports: [CommonModule, DialogModule, ButtonModule, MatIconModule],
  templateUrl: './advanced-series-tag.html',
  styleUrl: './advanced-series-tag.scss',
})
export class AdvancedSeriesTag {
  series = input<StallSeries | null>();

  private _tagService = inject(TagService);

  options = computed(() => {
    return this.series();
  });

  isAdvancedTagSelected(seriesId: number | undefined, key: string, tagId: number): boolean {
    if (!seriesId) return false;

    return this._tagService.selectedAdvancedTagsId[seriesId]?.[key]?.has(tagId) ?? false;
  }

  toggleAdvancedTag(seriesId: number | undefined, key: string, tagId: number) {
    if (!seriesId) return;

    this._tagService.toggleAdvancedTag(seriesId, key, tagId);
  }

  clearTags(seriesId: number | undefined, type: 'cp' | 'char') {
    if (!seriesId) return;

    this._tagService.clearAdvancedTag(seriesId, type);
  }
}
