import { CommonModule } from '@angular/common';
import { Component, inject, OnInit, ViewChild } from '@angular/core';
import { FormsModule, ReactiveFormsModule, FormGroup, FormControl } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { Divider } from 'primeng/divider';
import { FloatLabelModule } from 'primeng/floatlabel';
import { InputTextModule } from 'primeng/inputtext';
import { BaseWishlist } from '../base-wishlist';
import { C4100MConfig } from '../../model/coomic4-100-m/coomic4-100-m';
import { Coomic4100MView } from '../../view/coomic4-100-m-view/coomic4-100-m-view';
import { toSignal } from '@angular/core/rxjs-interop';
import { Coomic4100MService } from '../../model/coomic4-100-m/coomic4-100-m-service';
import { Tooltip } from 'primeng/tooltip';

@Component({
  selector: 'app-coomic4-100-m',
  imports: [
    CommonModule,
    ButtonModule,
    InputTextModule,
    FloatLabelModule,
    FormsModule,
    ReactiveFormsModule,
    Divider,
    Coomic4100MView,
    Tooltip,
  ],
  templateUrl: './coomic4-100-m.html',
  styleUrl: './coomic4-100-m.scss',
})
export class Coomic4100M extends BaseWishlist<C4100MConfig> implements OnInit {
  @ViewChild(Coomic4100MView) view!: Coomic4100MView;

  formGroup = new FormGroup({
    authorName: new FormControl(''),
    stallId: new FormControl(''),
  });

  private _service = inject(Coomic4100MService);
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
    this.view?.loadData();
  }
}
