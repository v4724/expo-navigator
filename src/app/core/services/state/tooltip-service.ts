import { CommonModule } from '@angular/common';
import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class TooltipService {
  private _target = new BehaviorSubject<HTMLElement | null>(null);

  private _showTooltip = new BehaviorSubject<boolean>(false);
  showTooltip$ = this._showTooltip.asObservable();

  private _label = new BehaviorSubject<string>('');
  label$ = this._label.asObservable();

  get target() {
    return this._target.getValue();
  }

  show(label: string, target: HTMLElement) {
    this._label.next(label);
    this._target.next(target);
    this._showTooltip.next(true);
  }

  hide() {
    this._showTooltip.next(false);
  }
}
