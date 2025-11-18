import { Component, inject, OnInit, ViewChild } from '@angular/core';
import { IonModal, IonContent } from '@ionic/angular/standalone';
import { distinctUntilChanged, filter } from 'rxjs/operators';
import { SelectStallService } from 'src/app/core/services/state/select-stall-service';
import { StallSideNav } from 'src/app/components/stall-info-ui/stall-side-nav/stall-side-nav';
import { StallMapService } from 'src/app/core/services/state/stall-map-service';

@Component({
  selector: 'app-stall-info-sheet',
  imports: [IonModal, IonContent, StallSideNav],
  templateUrl: './stall-info-sheet.html',
  styleUrl: './stall-info-sheet.scss',
})
export class StallInfoSheet implements OnInit {
  @ViewChild('modal', { static: true }) modal!: IonModal;

  private _selectStallService = inject(SelectStallService);
  private _stallMapService = inject(StallMapService);

  ngOnInit(): void {
    this._selectStallService.selectedStallId$
      .pipe(
        filter((id) => !!id),
        distinctUntilChanged(),
      )
      .subscribe((id) => {
        this.modal.present().then(() => {
          this.modal.setCurrentBreakpoint(0.5);
        });
        if (id) {
          setTimeout(() => {
            this._stallMapService.focusStall(id);
          }, 100);
        }
      });
  }

  close() {
    this.modal.dismiss();
  }
}
