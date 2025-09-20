import { Component, inject, input, InputSignal, OnInit, signal } from '@angular/core';
import { StallData } from './stall-.interface';
import { CommonModule } from '@angular/common';
import { toObservable } from '@angular/core/rxjs-interop';
import { map } from 'rxjs';
import { StallService } from 'src/app/core/services/state/stall-service';

@Component({
  selector: 'app-stall',
  imports: [CommonModule],
  templateUrl: './stall.html',
  styleUrl: './stall.scss',
})
export class Stall implements OnInit {
  stall: InputSignal<StallData> = input.required();

  private _stallSevice = inject(StallService);

  isGroupedMember$ = toObservable(this.stall).pipe(
    map((stall) => {
      return this._stallSevice.isGroupedMember(stall.id);
    })
  );

  isSelected = signal<boolean>(false);

  ngOnInit() {
    this._stallSevice.selectedStallId$.subscribe((selectedStall) => {
      this.isSelected.set(this.stall().id === selectedStall);
    });
  }
}
