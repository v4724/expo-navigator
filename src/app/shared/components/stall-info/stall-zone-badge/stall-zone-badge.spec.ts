import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StallZoneBadge } from './stall-zone-badge';

describe('StallZoneBadge', () => {
  let component: StallZoneBadge;
  let fixture: ComponentFixture<StallZoneBadge>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StallZoneBadge]
    })
    .compileComponents();

    fixture = TestBed.createComponent(StallZoneBadge);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
