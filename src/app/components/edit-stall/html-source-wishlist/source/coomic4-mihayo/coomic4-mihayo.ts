import { Component, inject, OnInit, ViewChild } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormGroup, FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { WishlistDefaultService } from '../../model/default-service';
import { DefaultView } from '../../view/default-view/default-view';
import { BaseWishlist } from '../base-wishlist';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { Divider } from 'primeng/divider';
import { FloatLabelModule } from 'primeng/floatlabel';
import { InputTextModule } from 'primeng/inputtext';
import { Tooltip } from 'primeng/tooltip';
import { WishlistConfig } from '../../model/base-model';
import { Coomic4HeroService } from '../../model/coomic4-hero-mihayo/coomic4-hero-service';
import { Coomic4MihayoService } from '../../model/coomic4-hero-mihayo/coomic4-mihayo-service';
import { Coomic4MihayoView } from '../../view/coomic4-mihayo-view/coomic4-mihayo-view';

@Component({
  selector: 'app-coomic4-mihayo',
  imports: [
    CommonModule,
    ButtonModule,
    InputTextModule,
    FloatLabelModule,
    FormsModule,
    ReactiveFormsModule,
    Divider,
    Tooltip,
    Coomic4MihayoView,
  ],
  templateUrl: './coomic4-mihayo.html',
  styles: '',
})
export class Coomic4Mihayo extends BaseWishlist<WishlistConfig> implements OnInit {
  @ViewChild(DefaultView) view!: DefaultView;

  formGroup = new FormGroup({
    authorName: new FormControl(''),
    stallId: new FormControl(''),
  });

  private _service = inject(Coomic4MihayoService);
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
