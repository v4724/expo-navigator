import { Component, computed, input, InputSignal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PromoStall } from 'src/app/core/interfaces/promo-stall.interface';
import { Coomic4R1View } from '../view/coomic4-r1-view/coomic4-r1-view';
import { Coomic4UotoView } from '../view/coomic4-uoto-view/coomic4-uoto-view';
import { Coomic4NucarnivalView } from '../view/coomic4-nucarnival-view/coomic4-nucarnival-view';
import { Coomic4ToukenView } from '../view/coomic4-touken-view/coomic4-touken-view';
import { Coomic4KoreaView } from '../view/coomic4-korea-view/coomic4-korea-view';
import { Coomic4100MView } from '../view/coomic4-100-m-view/coomic4-100-m-view';
import { Coomic4KimetsuView } from '../view/coomic4-kimetsu-view/coomic4-kimetsu-view';
import { Coomic4BokyakuView } from '../view/coomic4-bokyaku-view/coomic4-bokyaku-view';
import { DefaultView } from '../view/default-view/default-view';
import { Coomic4OrigView } from '../view/coomic4-orig-view/coomic4-orig-view';
import { Coomic4HeroView } from '../view/coomic4-hero-view/coomic4-hero-view';
import { Coomic4MihayoView } from '../view/coomic4-mihayo-view/coomic4-mihayo-view';
import { Coomic4Nijisanji } from '../source/coomic4-nijisanji/coomic4-nijisanji';
import { Coomic4NijisanjiView } from '../view/coomic4-nijisanji-view/coomic4-nijisanji-view';
import { Coomic4NintamaView } from '../view/coomic4-nintama-view/coomic4-nintama-view';
import { Coomic4LoveView } from '../view/coomic4-love-view/coomic4-love-view';

/**
 * 攤位編輯 - 吃土單入口
 * 列出本次有定義的吃土單入口
 */
@Component({
  selector: 'app-wishlist-entrance-view',
  imports: [
    CommonModule,
    Coomic4R1View,
    Coomic4UotoView,
    Coomic4NucarnivalView,
    Coomic4ToukenView,
    Coomic4KoreaView,
    Coomic4100MView,
    Coomic4KimetsuView,
    Coomic4BokyakuView,
    DefaultView,
    Coomic4OrigView,
    Coomic4HeroView,
    Coomic4MihayoView,
    Coomic4NijisanjiView,
    Coomic4NintamaView,
    Coomic4LoveView,
  ],
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
