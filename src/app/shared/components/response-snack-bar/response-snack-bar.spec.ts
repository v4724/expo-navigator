import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ResponseSnackBar } from './response-snack-bar';

describe('ResponseSnackBar', () => {
  let component: ResponseSnackBar;
  let fixture: ComponentFixture<ResponseSnackBar>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ResponseSnackBar]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ResponseSnackBar);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
