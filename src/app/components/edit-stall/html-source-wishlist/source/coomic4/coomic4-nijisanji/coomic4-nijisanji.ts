import { Component, inject } from '@angular/core';
import { ControlContainer } from '@angular/forms';
import { WishlistDefaultService } from '../../../model/default-service';
import { CommonModule } from '@angular/common';
import { Coomic4NijisanjiService } from '@coomic4Model/coomic4/coomic4-nijisanji/coomic4-nijisanji-service';
import { Default } from '../../default/default';

@Component({
  selector: 'app-coomic4-nijisanji',
  imports: [CommonModule, Default],
  template: ` <app-default></app-default>`,
  styles: '',
  providers: [{ provide: WishlistDefaultService, useExisting: Coomic4NijisanjiService }],
  viewProviders: [
    {
      provide: ControlContainer,
      useFactory: () => inject(ControlContainer, { skipSelf: true }),
    },
  ],
})
export class Coomic4Nijisanji {}
