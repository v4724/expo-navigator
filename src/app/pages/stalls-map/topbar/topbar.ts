import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { MatIcon } from '@angular/material/icon';

import { ToggleController } from 'src/app/components/layers-controller/toggle-controller/toggle-controller';
import { User } from 'src/app/components/user/user';

@Component({
  selector: 'app-topbar',
  imports: [CommonModule, MatIcon, ToggleController, User],
  templateUrl: './topbar.html',
  styleUrl: './topbar.scss',
})
export class Topbar {}
