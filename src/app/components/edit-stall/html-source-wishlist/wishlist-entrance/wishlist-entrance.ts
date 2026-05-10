import {
  Component,
  inject,
  input,
  InputSignal,
  OnInit,
  signal,
  WritableSignal,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { Coomic4R1 } from '../source/coomic4-r1/coomic4-r1';
import { ControlContainer, FormGroup } from '@angular/forms';
import { Coomic4Uoto } from '../source/coomic4-uoto/coomic4-uoto';

/**
 * 攤位編輯 - 吃土單入口
 * 列出本次有定義的吃土單入口
 */
@Component({
  selector: 'app-wishlist-entrance',
  imports: [CommonModule, Coomic4R1, Coomic4Uoto],
  templateUrl: './wishlist-entrance.html',
  styleUrl: './wishlist-entrance.scss',
  viewProviders: [
    {
      provide: ControlContainer,
      useFactory: () => inject(ControlContainer, { skipSelf: true }),
    },
  ],
})
export class WishlistEntrance implements OnInit {
  protected parentContainer = inject(ControlContainer);

  wishlistId: WritableSignal<string> = signal('');

  ngOnInit() {
    const control = this.parentForm.get('htmlWishlistId') as FormGroup;
    this.wishlistId.set(control?.value || '');
    control?.valueChanges.pipe().subscribe((val) => {
      this.wishlistId.set(val);
    });
  }

  get parentForm(): FormGroup {
    return this.parentContainer.control as FormGroup;
  }
}
