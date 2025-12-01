import { Component, ElementRef, inject, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { InputTextModule } from 'primeng/inputtext';
import { SearchAndFilterService } from 'src/app/core/services/state/search-and-filter-service';
import { InputIcon } from 'primeng/inputicon';
import { IconField } from 'primeng/iconfield';
import { DynamicDialogRef } from 'primeng/dynamicdialog';
import { LeftSidebarService } from 'src/app/core/services/state/left-sidebar-service';

@Component({
  selector: 'app-input-search',
  imports: [InputIcon, IconField, InputTextModule, FormsModule],
  templateUrl: './input-search.html',
  styleUrl: './input-search.scss',
})
export class InputSearch {
  @ViewChild('searchInput') searchInput!: ElementRef<HTMLInputElement>;

  private _searchAndFilterService = inject(SearchAndFilterService);
  private readonly _leftSidebarService = inject(LeftSidebarService);

  currDialogRef: DynamicDialogRef<any> | null = null;

  input() {
    const searchTerm = this.searchInput.nativeElement.value.toLowerCase().trim();
    this._searchAndFilterService.inputSearch = searchTerm;
  }

  clear() {
    this.searchInput.nativeElement.value = '';
    this._searchAndFilterService.inputSearch = '';
  }

  openAdvancedFilter() {
    this._leftSidebarService.show('advancedFilter');
  }

  closeAdvancedFilter() {
    this._leftSidebarService.toggle('');
  }
}
