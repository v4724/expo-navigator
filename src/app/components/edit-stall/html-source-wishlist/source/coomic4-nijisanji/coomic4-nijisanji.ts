import { Component, inject, OnInit, ViewChild } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormGroup, FormControl, ControlContainer } from '@angular/forms';
import { WishlistDefaultService } from '../../model/default-service';
import { DefaultView } from '../../view/default-view/default-view';
import { BaseWishlist } from '../base-wishlist';
import { CommonModule } from '@angular/common';
import { WishlistConfig } from '../../model/base-model';
import { Coomic4NijisanjiService } from '../../model/coomic4-nijisanji/coomic4-nijisanji-service';
import { Default } from '../default/default';

@Component({
  selector: 'app-coomic4-nijisanji',
  imports: [CommonModule, Default],
  template: ` <app-default></app-default>`,
  styles: '',
  providers: [{ provide: WishlistDefaultService, useClass: Coomic4NijisanjiService }],
  viewProviders: [
    {
      provide: ControlContainer,
      useFactory: () => inject(ControlContainer, { skipSelf: true }),
    },
  ],
})
export class Coomic4Nijisanji {}
