import { Component, inject, OnInit, ViewChild } from '@angular/core';
import { FormGroup, FormControl, ControlContainer } from '@angular/forms';
import { WishlistDefaultService } from '../../../model/default-service';
import { CommonModule } from '@angular/common';
import { Coomic4NintamaService } from '../../../model/coomic4/coomic4-nintama/coomic4-nintama-service';
import { Default } from '../../default/default';

@Component({
  selector: 'app-coomic4-nintama',
  imports: [CommonModule, Default],
  template: ` <app-default></app-default>`,
  styles: '',
  providers: [
    {
      provide: WishlistDefaultService,
      useExisting: Coomic4NintamaService,
    },
  ],
  viewProviders: [
    {
      provide: ControlContainer,
      useFactory: () => inject(ControlContainer, { skipSelf: true }),
    },
  ],
})
export class Coomic4Nintama {}
