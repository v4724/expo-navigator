import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LeftSidebarService } from 'src/app/core/services/state/left-sidebar-service';
import { Button } from 'primeng/button';

@Component({
  selector: 'app-marked-list-btn',
  imports: [CommonModule, Button],
  template: `<p-button
    icon="pi pi-bookmark-fill"
    [rounded]="true"
    [outlined]="true"
    (click)="openModal()"
  />`,
  styles: '',
})
export class MarkedListBtn {
  private readonly _leftSidebarService = inject(LeftSidebarService);

  openModal() {
    this._openSidebar();
  }

  private _openSidebar() {
    this._leftSidebarService.toggle('bookmarkList');
  }
}
