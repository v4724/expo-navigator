import { Component } from '@angular/core';
import { Lightbox } from 'src/app/shared/components/lightbox/lightbox';
import { Tooptip } from 'src/app/shared/components/tooptip/tooptip';
import { CommonModule } from '@angular/common';
import { Topbar } from './topbar/topbar';
import { Map } from './map/map';
import { MatSidenavModule } from '@angular/material/sidenav';
import { EditBtn } from 'src/app/components/edit-stall/edit-btn/edit-btn';
import { StallSideNav } from 'src/app/components/stall-info-ui/stall-side-nav/stall-side-nav';
import { LeftSidebar } from 'src/app/components/left-sidebar/left-sidebar';

@Component({
  selector: 'app-stalls-map',
  imports: [
    Lightbox,
    Tooptip,
    CommonModule,
    Topbar,
    Map,
    MatSidenavModule,
    StallSideNav,
    EditBtn,
    LeftSidebar,
  ],
  templateUrl: './stalls-map.html',
  styleUrl: './stalls-map.scss',
})
export class StallsMap {}
