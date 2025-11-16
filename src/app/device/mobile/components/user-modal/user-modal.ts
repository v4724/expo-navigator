import { Component, inject } from '@angular/core';
import {
  AnimationController,
  IonModal,
  IonContent,
  IonList,
  IonAvatar,
  IonLabel,
  IonImg,
  IonItem,
  IonButton,
  IonIcon,
  IonFooter,
  IonToolbar,
  IonButtons,
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { close } from 'ionicons/icons';

@Component({
  selector: 'app-user-modal',
  imports: [
    IonModal,
    IonContent,
    IonList,
    IonAvatar,
    IonLabel,
    IonImg,
    IonItem,
    IonButton,
    IonIcon,
    IonFooter,
    IonToolbar,
    IonButtons,
  ],
  templateUrl: './user-modal.html',
  styleUrl: './user-modal.scss',
})
export class UserModal {
  private animationCtrl = inject(AnimationController);

  constructor() {
    addIcons({ close });
  }

  enterAnimation = (baseEl: HTMLElement) => {
    const root = baseEl.shadowRoot;

    const backdropAnimation = this.animationCtrl
      .create()
      .addElement(root!.querySelector('ion-backdrop')!)
      .fromTo('opacity', '0.01', 'var(--backdrop-opacity)');

    const wrapperAnimation = this.animationCtrl
      .create()
      .addElement(root!.querySelector('.modal-wrapper')!)
      .keyframes([
        { offset: 0, opacity: '0', transform: 'scale(0)' },
        { offset: 1, opacity: '0.99', transform: 'scale(1)' },
      ]);

    return this.animationCtrl
      .create()
      .addElement(baseEl)
      .easing('ease-out')
      .duration(500)
      .addAnimation([backdropAnimation, wrapperAnimation]);
  };

  leaveAnimation = (baseEl: HTMLElement) => {
    return this.enterAnimation(baseEl).direction('reverse');
  };
}
