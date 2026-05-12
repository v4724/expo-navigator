import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DefaultView } from './default-view';

describe('DefaultView', () => {
  let component: DefaultView;
  let fixture: ComponentFixture<DefaultView>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DefaultView]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DefaultView);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
