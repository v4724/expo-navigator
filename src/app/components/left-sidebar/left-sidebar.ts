import { Component } from '@angular/core';
import { ResultList } from 'src/app/components/search-and-filter/result-list/result-list';
import { LayersController } from 'src/app/components/layers-controller/layers-controller';

@Component({
  selector: 'app-left-sidebar',
  imports: [ResultList, LayersController],
  templateUrl: './left-sidebar.html',
  styleUrl: './left-sidebar.scss',
})
export class LeftSidebar {}
