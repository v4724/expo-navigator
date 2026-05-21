import { Component, inject, OnInit, ViewChild } from '@angular/core';
import { FormGroup, FormControl, ControlContainer } from '@angular/forms';
import { WishlistDefaultService } from '../../model/default-service';
import { CommonModule } from '@angular/common';
import { Coomic4LoveService } from '../../model/coomic4-love/coomic4-love-service';
import { Default } from '../default/default';

@Component({
  selector: 'app-coomic4-love',
  imports: [CommonModule, Default],
  template: `<app-default></app-default>`,
  styles: '',
  providers: [
    {
      provide: WishlistDefaultService,
      useExisting: Coomic4LoveService,
    },
  ],
  viewProviders: [
    {
      provide: ControlContainer,
      useFactory: () => inject(ControlContainer, { skipSelf: true }),
    },
  ],
})
export class Coomic4Love {}
