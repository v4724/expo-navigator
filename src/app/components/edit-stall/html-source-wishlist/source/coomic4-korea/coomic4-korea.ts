import { CommonModule } from '@angular/common';
import { Component, inject, OnInit, ViewChild } from '@angular/core';
import { FormsModule, ReactiveFormsModule, FormGroup, FormControl } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { Divider } from 'primeng/divider';
import { FloatLabelModule } from 'primeng/floatlabel';
import { InputTextModule } from 'primeng/inputtext';
import { BaseWishlist } from '../base-wishlist';
import { C4KoreaConfig } from '../../model/coomic4-korea/coomic4-korea';
import { Coomic4KoreaView } from '../../view/coomic4-korea-view/coomic4-korea-view';
import { toSignal } from '@angular/core/rxjs-interop';
import { Coomic4KoreaService } from '../../model/coomic4-korea/coomic4-korea-service';
import { Tooltip } from 'primeng/tooltip';

@Component({
  selector: 'app-coomic4-korea',
  imports: [
    CommonModule,
    ButtonModule,
    InputTextModule,
    FloatLabelModule,
    FormsModule,
    ReactiveFormsModule,
    Divider,
    Coomic4KoreaView,
    Tooltip,
  ],
  templateUrl: './coomic4-korea.html',
  styleUrl: './coomic4-korea.scss',
})
export class Coomic4Korea extends BaseWishlist<C4KoreaConfig> implements OnInit {
  @ViewChild(Coomic4KoreaView) view!: Coomic4KoreaView;

  formGroup = new FormGroup({
    authorName: new FormControl(''),
    stallId: new FormControl(''),
  });

  private _service = inject(Coomic4KoreaService);
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
