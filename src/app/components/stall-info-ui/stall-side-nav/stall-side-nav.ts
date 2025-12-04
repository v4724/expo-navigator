import { CommonModule } from '@angular/common';
import { AfterViewInit, Component, inject, input, OnInit, output } from '@angular/core';
import { SelectStallService } from 'src/app/core/services/state/select-stall-service';
import { StallData } from '../../../core/interfaces/stall.interface';
import { ButtonModule } from 'primeng/button';
import { StallSideHeader } from './stall-side-header/stall-side-header';
import { StallSideContent } from './stall-side-content/stall-side-content';
import { distinctUntilChanged, filter } from 'rxjs';
import { EditBtn } from '../../edit-stall/edit-btn/edit-btn';

@Component({
  selector: 'app-stall-side-nav',
  imports: [CommonModule, ButtonModule, StallSideHeader, StallSideContent, EditBtn],
  templateUrl: './stall-side-nav.html',
  styleUrl: './stall-side-nav.scss',
})
export class StallSideNav implements OnInit, AfterViewInit {
  isPreview = input<boolean>(false);
  previewStall = input<StallData>();

  open = output<boolean>();
  close = output<boolean>();

  private _selectStallService = inject(SelectStallService);

  ngOnInit() {
    if (this.isPreview()) {
    } else {
      this._selectStallService.selectedStallId$
        .pipe(
          filter((stallId) => !!stallId),
          distinctUntilChanged(),
        )
        .subscribe((stallId) => {
          this.open.emit(true);
        });
    }
  }

  ngAfterViewInit(): void {}

  /**
   * Hides the modal and clears any selection.
   * @param context An object containing all necessary dependencies.
   */
  closeModal() {
    if (!this.isPreview()) {
      this._selectStallService.clearSelection();
    }
    this.close.emit(true);
  }
}
