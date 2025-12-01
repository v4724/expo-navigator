import { inject, Pipe, PipeTransform } from '@angular/core';
import { TagService } from 'src/app/core/services/state/tag-service';

@Pipe({
  name: 'tagPipe',
  standalone: true,
})
export class TagPipe implements PipeTransform {
  private _tagService = inject(TagService);

  constructor() {}

  transform(id: number | null | undefined): string {
    if (!id || isNaN(id)) {
      return '';
    }

    const tag = this._tagService.getTagById(id);
    if (!tag) return '';

    return tag.addGroupName ? `${tag.groupName}-${tag.tagName}` : tag.tagName;
  }
}
