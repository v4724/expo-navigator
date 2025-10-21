import { Component, ElementRef, inject, ViewChild } from '@angular/core';
import { SearchAndFilterService } from 'src/app/core/services/state/search-and-filter-service';

@Component({
  selector: 'app-input-search',
  imports: [],
  templateUrl: './input-search.html',
  styleUrl: './input-search.scss',
})
export class InputSearch {
  @ViewChild('searchInput') searchInput!: ElementRef<HTMLInputElement>;

  private _searchAndFilterService = inject(SearchAndFilterService);

  input() {
    const searchTerm = this.searchInput.nativeElement.value.toLowerCase().trim();
    this._searchAndFilterService.inputSearch = searchTerm;
  }
}
