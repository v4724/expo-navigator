import { CommonModule } from '@angular/common';
import { Component, inject, OnInit, ViewChild } from '@angular/core';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { FloatLabelModule } from 'primeng/floatlabel';
import { InputTextModule } from 'primeng/inputtext';
import { Divider } from 'primeng/divider';
import { BaseWishlist } from '../../base-wishlist';
import { C4R1Config } from '../../../model/coomic4/coomic4-r1/coomic4-r1';
import { Coomic4R1View } from '../../../view/coomic4/coomic4-r1-view/coomic4-r1-view';
import { Tooltip } from 'primeng/tooltip';
import { Coomic4R1Service } from '../../../model/coomic4/coomic4-r1/coomic4-r1-service';
import { toSignal } from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-coomic4-r1',
  imports: [
    CommonModule,
    ButtonModule,
    InputTextModule,
    FloatLabelModule,
    FormsModule,
    ReactiveFormsModule,
    Divider,
    Coomic4R1View,
    Tooltip,
  ],
  templateUrl: './coomic4-r1.html',
  styleUrl: './coomic4-r1.scss',
})
export class Coomic4R1 extends BaseWishlist<C4R1Config> implements OnInit {
  @ViewChild(Coomic4R1View) view!: Coomic4R1View;

  formGroup = new FormGroup({
    authorName: new FormControl(''),
    stallId: new FormControl(''),
  });
  private _service = inject(Coomic4R1Service);
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
