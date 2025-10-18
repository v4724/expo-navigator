import { CommonModule } from '@angular/common';
import { Component, forwardRef, inject, input, OnInit, output } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { FloatLabel } from 'primeng/floatlabel';
import { InputTextModule } from 'primeng/inputtext';
import { Stall } from 'src/app/components/stall/stall';
import { StallData } from 'src/app/components/stall/stall.interface';
import { StallService } from 'src/app/core/services/state/stall-service';

@Component({
  selector: 'app-stall-filter-input',
  imports: [CommonModule, FloatLabel, InputTextModule],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => StallFilterInput),
      multi: true,
    },
  ],
  templateUrl: './stall-filter-input.html',
  styleUrl: './stall-filter-input.scss',
})
export class StallFilterInput implements ControlValueAccessor {
  showTitle = input<boolean>();
  onSelect = output<StallData>();

  private _stallService = inject(StallService);

  private get allStalls() {
    return this._stallService.allStalls;
  }

  value = '';
  disabled = false;

  filteredStalls: StallData[] = [];
  popupStyle: any = {};

  onChange = (value: any) => {};
  onTouched = () => {};

  writeValue(value: any): void {
    this.value = value ?? '';
  }

  registerOnChange(fn: any): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;
  }

  onInput(value: string) {
    this.value = value;
    this.onChange(value);
    this.filteredStalls = this.filter(value);
  }

  onBlur() {
    this.onTouched();
  }

  onStallIdKeydown(event: KeyboardEvent) {
    if (event.key === 'Enter') {
      event.preventDefault();
      this.addStallId();
    }
  }

  filter(value: string): StallData[] {
    const keyword = (value || '').toLowerCase();

    if (!value) return [];

    const filter = this.allStalls.filter(
      (stall) =>
        stall.id.toLowerCase().includes(keyword) ||
        stall.stallTitle.toLowerCase().includes(keyword),
    );

    return filter;
  }

  addStallId(stall?: StallData) {
    if (!stall) {
      const first = this.filteredStalls[0];
      if (first) {
        this.onChange(first.id);
        this.onSelect.emit(first);

        this.value = '';
        this.filteredStalls = [];
      }
    } else {
      this.onChange(stall.id);
      this.onSelect.emit(stall);

      this.value = '';
      this.filteredStalls = [];
    }
  }
}
