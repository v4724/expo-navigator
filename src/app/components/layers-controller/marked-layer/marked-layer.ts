import { CommonModule } from '@angular/common';
import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { MatIconModule } from '@angular/material/icon';
import { MarkedStallService } from 'src/app/core/services/state/marked-stall-service';
import { CdkDrag, CdkDragDrop, CdkDropList, moveItemInArray } from '@angular/cdk/drag-drop';
import { MarkedList } from 'src/app/core/interfaces/marked-stall.interface';
import { SelectStallService } from 'src/app/core/services/state/select-stall-service';

@Component({
  selector: 'app-marked-layer',
  imports: [CommonModule, MatIconModule],
  templateUrl: './marked-layer.html',
  styleUrl: './marked-layer.scss',
})
export class MarkedLayer implements OnInit {
  isSectionOpen = signal(false);

  // Helpers
  private _markedStallService = inject(MarkedStallService);
  private _selectStallService = inject(SelectStallService);

  show = toSignal(this._markedStallService.layerShown$);

  // data
  fetchEnd = toSignal(this._markedStallService.fetchEnd$);
  allList = toSignal(this._markedStallService.markedList$, { initialValue: [] });

  ngOnInit(): void {}

  toggleSection() {
    this.isSectionOpen.update((v) => !v);
  }

  toggleLayer() {
    this._markedStallService.toggleLayer();
  }

  toggleList(list: MarkedList) {
    console.log(list);
    list.show = !list.show;
    this._markedStallService.toggleList(list);
  }

  editList(list: MarkedList) {}

  drop(event: CdkDragDrop<MarkedList[]>) {
    const newArr = [...this.allList()];
    moveItemInArray(newArr, event.previousIndex, event.currentIndex);
    this._markedStallService.allList = newArr;
  }

  selectStall(stallId: string) {
    this._selectStallService.selected = stallId;
  }
}
