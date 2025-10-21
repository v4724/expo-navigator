import { inject, Pipe, PipeTransform } from '@angular/core';
import { TagService } from 'src/app/core/services/state/tag-service';

@Pipe({
  name: 'seriesPipe',
  standalone: true,
})
export class SeriesPipe implements PipeTransform {
  private _tagService = inject(TagService);

  constructor() {}

  transform(id: number | null | undefined): string {
    if (!id || isNaN(id)) {
      return '';
    }

    return this._tagService.getSeriesById(id)?.seriesName ?? '';
  }
}
