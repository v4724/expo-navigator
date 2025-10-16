import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DownloadMap } from './download-map';

describe('DownloadMap', () => {
  let component: DownloadMap;
  let fixture: ComponentFixture<DownloadMap>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DownloadMap]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DownloadMap);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
