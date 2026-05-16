import { Component, inject, OnInit, ViewChild } from '@angular/core';
import { Coomic4OrigView } from '../../view/coomic4-orig-view/coomic4-orig-view';
import { Coomic4OrigService } from '../../model/coomic4-orig/coomic4-orig-service';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormGroup, FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { C4OrigConfig } from '../../model/coomic4-orig/coomic4-orig';
import { BaseWishlist } from '../base-wishlist';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { Divider } from 'primeng/divider';
import { FloatLabelModule } from 'primeng/floatlabel';
import { InputTextModule } from 'primeng/inputtext';
import { Tooltip } from 'primeng/tooltip';

@Component({
  selector: 'app-coomic4-orig',
  imports: [
    CommonModule,
    ButtonModule,
    InputTextModule,
    FloatLabelModule,
    FormsModule,
    ReactiveFormsModule,
    Divider,
    Coomic4OrigView,
    Tooltip,
  ],
  templateUrl: './coomic4-orig.html',
  styleUrl: './coomic4-orig.scss',
})
export class Coomic4Orig extends BaseWishlist<C4OrigConfig> implements OnInit {
  @ViewChild(Coomic4OrigView) view!: Coomic4OrigView;

  formGroup = new FormGroup({
    authorName: new FormControl(''),
    stallId: new FormControl(''),
  });
  private _service = inject(Coomic4OrigService);
  fetchEnd = toSignal(this._service.fetchEnd$());

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
