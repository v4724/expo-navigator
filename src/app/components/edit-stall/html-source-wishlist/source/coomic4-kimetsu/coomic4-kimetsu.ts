import { CommonModule } from '@angular/common';
import { Component, inject, OnInit, ViewChild } from '@angular/core';
import { FormsModule, ReactiveFormsModule, FormGroup, FormControl } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { Divider } from 'primeng/divider';
import { FloatLabelModule } from 'primeng/floatlabel';
import { InputTextModule } from 'primeng/inputtext';
import { BaseWishlist } from '../base-wishlist';
import { C4KimetsuConfig } from '../../model/coomic4-kimetsu/coomic4-kimetsu';
import { Coomic4KimetsuView } from '../../view/coomic4-kimetsu-view/coomic4-kimetsu-view';
import { toSignal } from '@angular/core/rxjs-interop';
import { Coomic4KimetsuService } from '../../model/coomic4-kimetsu/coomic4-kimetsu-service';
import { Tooltip } from 'primeng/tooltip';

@Component({
  selector: 'app-coomic4-kimetsu',
  imports: [
    CommonModule,
    ButtonModule,
    InputTextModule,
    FloatLabelModule,
    FormsModule,
    ReactiveFormsModule,
    Divider,
    Coomic4KimetsuView,
    Tooltip,
  ],
  templateUrl: './coomic4-kimetsu.html',
  styleUrl: './coomic4-kimetsu.scss',
})
export class Coomic4Kimetsu extends BaseWishlist<C4KimetsuConfig> implements OnInit {
  @ViewChild(Coomic4KimetsuView) view!: Coomic4KimetsuView;

  formGroup = new FormGroup({
    authorName: new FormControl(''),
    stallId: new FormControl(''),
  });

  private _service = inject(Coomic4KimetsuService);
  fetchEnd = toSignal(this._service.fetchEnd$);

  get authorName() {
    return this.formGroup.get('authorName')?.value || '';
  }

  get stallId() {
    return this.formGroup.get('stallId')?.value || '';
  }

  constructor() {
    super();
  }

  ngOnInit(): void {
    this.formGroup.patchValue({
      authorName: this.data.authorName,
      stallId: this.data.stallId ?? this._stallId,
    });

    this.formGroup.valueChanges.subscribe(() => {
      this._data.authorName = this.authorName;
      this._data.stallId = this.stallId;
      this.parentForm.get('htmlWishlistConfigJson')?.setValue(this.toStr());
    });

    if (this.checkDataValidity()) {
      this.loadMappingWishlist();
    }
  }

  override checkDataValidity(): boolean {
    if (!this.authorName || !this.stallId) {
      return false;
    }
    return true;
  }

  override loadMappingWishlist() {
    this.view?.loadData(true);
  }
}
