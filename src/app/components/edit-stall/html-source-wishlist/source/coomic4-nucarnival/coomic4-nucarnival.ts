import { CommonModule } from '@angular/common';
import { Component, inject, OnInit, ViewChild } from '@angular/core';
import { FormsModule, ReactiveFormsModule, FormGroup, FormControl } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { Divider } from 'primeng/divider';
import { FloatLabelModule } from 'primeng/floatlabel';
import { InputTextModule } from 'primeng/inputtext';
import { BaseWishlist } from '../base-wishlist';
import { Coomic4NucarnivalView } from '../../view/coomic4-nucarnival-view/coomic4-nucarnival-view';
import { C4NucarnivalConfig } from '../../model/coomic4-nucarnival/coomic4-nucarnival';
import { toSignal } from '@angular/core/rxjs-interop';
import { Coomic4NucarnivalService } from '../../model/coomic4-nucarnival/coomic4-nucarnival-service';
import { Tooltip } from 'primeng/tooltip';

@Component({
  selector: 'app-coomic4-nucarnival',
  imports: [
    CommonModule,
    ButtonModule,
    InputTextModule,
    FloatLabelModule,
    FormsModule,
    ReactiveFormsModule,
    Divider,
    Coomic4NucarnivalView,
    Tooltip,
  ],
  templateUrl: './coomic4-nucarnival.html',
  styleUrl: './coomic4-nucarnival.scss',
})
export class Coomic4Nucarnival extends BaseWishlist<C4NucarnivalConfig> implements OnInit {
  @ViewChild(Coomic4NucarnivalView) view!: Coomic4NucarnivalView;

  formGroup = new FormGroup({
    authorName: new FormControl(''),
    stallId: new FormControl(''),
  });

  private _service = inject(Coomic4NucarnivalService);
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
