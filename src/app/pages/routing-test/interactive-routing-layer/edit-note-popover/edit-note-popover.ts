import { Component, inject, input, OnInit, signal, ViewChild } from '@angular/core';
import { PopoverModule, Popover } from 'primeng/popover';
import { MarkedList, MarkedStallInfo } from 'src/app/core/interfaces/marked-stall.interface';
import { PathNode } from '../../core/util';
import { TextareaModule } from 'primeng/textarea';
import { FormsModule } from '@angular/forms';
import { FloatLabelModule } from 'primeng/floatlabel';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { MarkedStallService } from 'src/app/core/services/state/marked-stall-service';
import { ButtonModule } from 'primeng/button';
import { MarkedListApiService } from 'src/app/core/services/api/marked-list-api.service';
import { UserService } from 'src/app/core/services/state/user-service';
import { MessageService } from 'primeng/api';
import { finalize } from 'rxjs';

@Component({
  selector: 'app-edit-note-popover',
  imports: [PopoverModule, FloatLabelModule, TextareaModule, FormsModule, ButtonModule],
  templateUrl: './edit-note-popover.html',
  styleUrl: './edit-note-popover.scss',
})
export class EditNotePopover implements OnInit {
  @ViewChild(Popover) op!: Popover;

  bookmark = input.required<MarkedList | undefined>();
  node = input.required<PathNode | undefined>();
  dismissable = input<boolean>(true);

  private _markedListApiService = inject(MarkedListApiService);
  private _markedListService = inject(MarkedStallService);
  private _messageService = inject(MessageService);
  private _userService = inject(UserService);

  user = toSignal(this._userService.user$);
  isSaving = signal(false);

  note = '';

  node$ = toObservable(this.node);
  bookmark$ = toObservable(this.bookmark);

  ngOnInit(): void {
    this.node$.subscribe(() => {
      this.note = this.node()?.info?.note ?? '';
    });
    this.bookmark$.subscribe((val) => {
      // console.log('???', val);
    });
  }

  save() {
    const info = this.node()?.info;
    if (info) {
      info.note = this.note;
    }

    const bookmark = this.bookmark();
    if (!bookmark) return;

    const dto = this._markedListApiService.transformToDto(bookmark);
    this.isSaving.set(true);
    this._markedListApiService
      .update(bookmark.id, this.user()?.acc!, dto)
      .pipe(
        finalize(() => {
          this.isSaving.set(false);
        }),
      )
      .subscribe((res) => {
        if (res.success) {
          this._markedListService.update(dto);
          this._messageService.add({
            severity: 'custom',
            summary: `儲存成功`,
          });
          this.op.hide();
        }
      });
  }

  cancel() {
    this.op.hide();
  }
}
