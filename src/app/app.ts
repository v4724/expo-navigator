import { Component, HostListener, OnInit, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { IonApp, IonRouterOutlet } from '@ionic/angular/standalone';
import { isPlatform } from '@ionic/core';
import { ConfirmDialog } from 'primeng/confirmdialog';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, IonApp, IonRouterOutlet, ConfirmDialog],
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App implements OnInit {
  protected readonly title = signal('expo-navigator');

  isMobileSize = signal<boolean>(true);

  ngOnInit() {
    this.loadAppropriateComponent();
  }

  loadAppropriateComponent() {
    // const isMobileWidth = window?.innerWidth <= 425;
    const isMobileWidth = false;
    const isMobilePlatform = typeof window !== 'undefined' && isPlatform('mobile');
    const isMobile = isMobileWidth || isMobilePlatform;
    this.isMobileSize.set(isMobile);
  }

  @HostListener('window:resize') onResize() {
    this.loadAppropriateComponent();
  }
}
