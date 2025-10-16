import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { User } from 'src/app/components/user/user';
import { DownloadMap } from 'src/app/components/download-map/download-map';
import { ToggleController } from 'src/app/components/layers-controller/toggle-controller/toggle-controller';
import { MatIcon } from '@angular/material/icon';

@Component({
  selector: 'app-topbar',
  imports: [CommonModule, User, DownloadMap, MatIcon, ToggleController],
  templateUrl: './topbar.html',
  styleUrl: './topbar.scss',
})
export class Topbar {}
