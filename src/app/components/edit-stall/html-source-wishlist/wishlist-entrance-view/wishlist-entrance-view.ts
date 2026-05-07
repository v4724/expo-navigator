import {
  Component,
  computed,
  inject,
  input,
  InputSignal,
  OnInit,
  signal,
  WritableSignal,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { Coomic4R1 } from '../source/coomic4-r1/coomic4-r1';
import { Input } from 'ckeditor5';
import { PromoStall } from 'src/app/core/interfaces/promo-stall.interface';
import { Coomic4R1View } from '../view/coomic4-r1-view/coomic4-r1-view';

/**
 * 攤位編輯 - 吃土單入口
 * 列出本次有定義的吃土單入口
 */
@Component({
  selector: 'app-wishlist-entrance-view',
  imports: [CommonModule, Coomic4R1View],
  templateUrl: './wishlist-entrance-view.html',
  styleUrl: './wishlist-entrance-view.scss',
})
export class WishlistEntranceView implements OnInit {
  promo: InputSignal<PromoStall> = input.required();
  wishlistId = computed(() => {
    return this.promo()?.promoHtmlWishlistId || '';
  });
  wishlistConfigJson = computed(() => {
    return this.promo()?.promoHtmlWishlistConfigJson || '{}';
  });

  ngOnInit() {}
}
