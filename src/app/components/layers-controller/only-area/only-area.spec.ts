import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OnlyArea } from './only-area';

describe('OnlyArea', () => {
  let component: OnlyArea;
  let fixture: ComponentFixture<OnlyArea>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OnlyArea]
    })
    .compileComponents();

    fixture = TestBed.createComponent(OnlyArea);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
