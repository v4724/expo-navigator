import { Component, inject, OnInit, ViewChild } from '@angular/core';
import { FormGroup, FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BaseWishlist } from '../../base-wishlist';
import { C4ToukenConfig } from '../../../model/coomic4/coomic4-touken/coomic4-touken';
import { Coomic4ToukenView } from '../../../view/coomic4/coomic4-touken-view/coomic4-touken-view';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { Divider } from 'primeng/divider';
import { FloatLabelModule } from 'primeng/floatlabel';
import { InputTextModule } from 'primeng/inputtext';
import { Coomic4ToukenService } from '../../../model/coomic4/coomic4-touken/coomic4-touken-service';
import { toSignal } from '@angular/core/rxjs-interop';
import { Tooltip } from 'primeng/tooltip';

@Component({
  selector: 'app-coomic4-touken',
  imports: [
    CommonModule,
    ButtonModule,
    InputTextModule,
    FloatLabelModule,
    FormsModule,
    ReactiveFormsModule,
    Divider,
    Coomic4ToukenView,
    Tooltip,
  ],
  templateUrl: './coomic4-touken.html',
  styleUrl: './coomic4-touken.scss',
})
export class Coomic4Touken extends BaseWishlist<C4ToukenConfig> implements OnInit {
  @ViewChild(Coomic4ToukenView) view!: Coomic4ToukenView;

  formGroup = new FormGroup({
    authorName: new FormControl(''),
    stallId: new FormControl(''),
  });
  private _service = inject(Coomic4ToukenService);
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
