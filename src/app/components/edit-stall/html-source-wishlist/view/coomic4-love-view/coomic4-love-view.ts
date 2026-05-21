import { Component, input, InputSignal, output } from '@angular/core';
import { WishlistDefaultService } from '../../model/default-service';
import { DefaultView } from '../default-view/default-view';
import { Coomic4LoveService } from '../../model/coomic4-love/coomic4-love-service';

@Component({
  selector: 'app-coomic4-love-view',
  imports: [DefaultView],
  template: `<app-default-view
    [wishlistId]="wishlistId()"
    [wishlistConfigJson]="wishlistConfigJson()"
    (customTagsFromView)="customTagsFromView.emit($event)"
  />`,
  styles: '',
  providers: [{ provide: WishlistDefaultService, useExisting: Coomic4LoveService }],
})
export class Coomic4LoveView {
  wishlistId: InputSignal<string> = input.required();
  wishlistConfigJson: InputSignal<string> = input.required();
  customTagsFromView = output<string>();
}
