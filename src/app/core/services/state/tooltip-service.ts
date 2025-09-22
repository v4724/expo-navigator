import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class TooltipService {
  private _target = new BehaviorSubject<HTMLElement | null>(null);

  private _showTooltip = new BehaviorSubject<boolean>(false);
  showTooltip$ = this._showTooltip.asObservable();

  private _innerHTML = new BehaviorSubject<string>('');
  innerHTML$ = this._innerHTML.asObservable();

  get target() {
    return this._target.getValue();
  }

  show(innerHtml: string, target: HTMLElement) {
    this._target.next(target);
    this._innerHTML.next(innerHtml);
    this._showTooltip.next(true);
  }

  hide() {
    this._showTooltip.next(false);
  }
}
