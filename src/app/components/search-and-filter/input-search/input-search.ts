import { Component, ElementRef, inject, ViewChild } from '@angular/core';
import { StallMapService } from 'src/app/core/services/state/stall-map-service';

@Component({
  selector: 'app-input-search',
  imports: [],
  templateUrl: './input-search.html',
  styleUrl: './input-search.scss',
})
export class InputSearch {
  @ViewChild('searchInput') searchInput!: ElementRef<HTMLInputElement>;

  private _stallMapService = inject(StallMapService);

  input() {
    const searchTerm = this.searchInput.nativeElement.value.toLowerCase().trim();
    this._stallMapService.inputSearch = searchTerm;
  }
}
