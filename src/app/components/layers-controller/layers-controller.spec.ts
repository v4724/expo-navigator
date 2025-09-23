import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LayersController } from './layers-controller';

describe('LayersController', () => {
  let component: LayersController;
  let fixture: ComponentFixture<LayersController>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LayersController]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LayersController);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
