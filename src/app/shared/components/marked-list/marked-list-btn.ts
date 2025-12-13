import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LeftSidebarService } from 'src/app/core/services/state/left-sidebar-service';
import { ButtonModule } from 'primeng/button';

@Component({
  selector: 'app-marked-list-btn',
  imports: [CommonModule, ButtonModule],
  template: `<div class="bg-white/60 dark:bg-zinc-700/60 rounded-full">
    <button
      pButton
      icon="pi pi-bookmark-fill"
      rounded
      outlined
      class="dark:text-gray-300!"
      (click)="openModal()"
    ></button>
  </div>`,
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
