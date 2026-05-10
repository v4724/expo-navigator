import { Component, OnInit, ViewChild } from '@angular/core';
import { BaseWishlist } from '../../base-wishlist';
import { FormGroup, FormControl, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { WishlistConfig } from '../../model/base-model';
import { Coomic4UotoView } from '../../view/coomic4-uoto-view/coomic4-uoto-view';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { Divider } from 'primeng/divider';
import { FloatLabelModule } from 'primeng/floatlabel';
import { InputTextModule } from 'primeng/inputtext';

@Component({
  selector: 'app-coomic4-uoto',
  imports: [
    CommonModule,
    ButtonModule,
    InputTextModule,
    FloatLabelModule,
    FormsModule,
    ReactiveFormsModule,
    Divider,
    Coomic4UotoView,
  ],
  templateUrl: './coomic4-uoto.html',
  styleUrl: './coomic4-uoto.scss',
})
export class Coomic4Uoto extends BaseWishlist<WishlistConfig> implements OnInit {
  @ViewChild(Coomic4UotoView) view!: Coomic4UotoView;

  formGroup = new FormGroup({
    authorName: new FormControl(''),
    stallId: new FormControl(''),
  });

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
      stallId: this.data.stallId,
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
