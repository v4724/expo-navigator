import { CommonModule } from '@angular/common';
import { Component, computed, inject, input, QueryList, ViewChildren } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { AccordionModule } from 'primeng/accordion';
import {
  StallGroup,
  StallSeries,
  StallTag,
} from 'src/app/core/interfaces/stall-series-tag.interface';
import { TagService } from 'src/app/core/services/state/tag-service';
import { toSignal } from '@angular/core/rxjs-interop';
import { BadgeModule } from 'primeng/badge';
import { Checkbox, CheckboxModule } from 'primeng/checkbox';
import { FormsModule } from '@angular/forms';

// 進階搜尋 - 指定 series 的標籤內容
@Component({
  selector: 'app-advanced-series-tag',
  imports: [
    CommonModule,
    DialogModule,
    ButtonModule,
    MatIconModule,
    AccordionModule,
    BadgeModule,
    CheckboxModule,
    FormsModule,
  ],
  templateUrl: './advanced-series-tag.html',
  styleUrl: './advanced-series-tag.scss',
})
export class AdvancedSeriesTag {
  @ViewChildren('checkbox') checkboxes!: QueryList<Checkbox>;

  series = input<StallSeries | null>();

  private _tagService = inject(TagService);

  options = computed(() => {
    return this.series();
  });

  selectedTags = toSignal(this._tagService.selectedAdvancedTagsId$);
  groupsForCnt = computed(() => {
    const selected = this.selectedTags();
    const seriesId = this.series()?.id;
    if (selected && seriesId && selected[seriesId]) {
      return selected[seriesId];
    }

    return null;
  });

  isAdvancedTagSelected(seriesId: number | undefined, groupId: number, tagId: number): boolean {
    if (!seriesId) return false;

    return this._tagService.selectedAdvancedTagsId[seriesId]?.[groupId]?.has(tagId) ?? false;
  }

  toggleAdvancedTag(seriesId: number | undefined, groupId: number, tag: StallTag) {
    if (!seriesId) return;

    this._tagService.toggleAdvancedTag(seriesId, groupId, tag.id);
  }

  clearTags(e: Event, seriesId: number | undefined, group: StallGroup) {
    e.stopPropagation();
    if (!seriesId) return;

    this._tagService.clearAdvancedTag(seriesId, group.id);
    this.checkboxes.forEach((item) => {
      const inputId = item.inputId;
      const inputGroupId = inputId?.split('-')[0];
      if (inputGroupId === group.id.toString()) {
        item.writeModelValue(false);
      }
    });
  }
}
