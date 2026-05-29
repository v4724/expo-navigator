import { Component, input, InputSignal, output } from '@angular/core';
import { WishlistDefaultService } from '../../../model/default-service';
import { DefaultView } from '../../default-view/default-view';
import { Coomic4NintamaService } from '../../../model/coomic4/coomic4-nintama/coomic4-nintama-service';

@Component({
  selector: 'app-coomic4-nintama-view',
  imports: [DefaultView],
  template: `<app-default-view
    [wishlistId]="wishlistId()"
    [wishlistConfigJson]="wishlistConfigJson()"
    (customTagsFromView)="customTagsFromView.emit($event)"
  />`,
  styles: '',
  providers: [{ provide: WishlistDefaultService, useExisting: Coomic4NintamaService }],
})
export class Coomic4NintamaView {
  wishlistId: InputSignal<string> = input.required();
  wishlistConfigJson: InputSignal<string> = input.required();
  customTagsFromView = output<string>();
}
