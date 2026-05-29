import { Component, input, InputSignal, output } from '@angular/core';
import { WishlistDefaultService } from '../../../model/default-service';
import { DefaultView } from '../../default-view/default-view';
import { Coomic4NijisanjiService } from '../../../model/coomic4/coomic4-nijisanji/coomic4-nijisanji-service';

@Component({
  selector: 'app-coomic4-nijisanji-view',
  imports: [DefaultView],
  template: `<app-default-view
    [wishlistId]="wishlistId()"
    [wishlistConfigJson]="wishlistConfigJson()"
    (customTagsFromView)="customTagsFromView.emit($event)"
  />`,
  styles: '',
  providers: [{ provide: WishlistDefaultService, useExisting: Coomic4NijisanjiService }],
})
export class Coomic4NijisanjiView {
  wishlistId: InputSignal<string> = input.required();
  wishlistConfigJson: InputSignal<string> = input.required();
  customTagsFromView = output<string>();
}
