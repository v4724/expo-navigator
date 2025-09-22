import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GroupIndicator } from './group-indicator';

describe('GroupIndicator', () => {
  let component: GroupIndicator;
  let fixture: ComponentFixture<GroupIndicator>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GroupIndicator]
    })
    .compileComponents();

    fixture = TestBed.createComponent(GroupIndicator);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
