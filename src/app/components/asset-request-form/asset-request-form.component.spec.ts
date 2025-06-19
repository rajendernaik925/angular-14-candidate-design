import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AssetRequestFormComponent } from './asset-request-form.component';

describe('AssetRequestFormComponent', () => {
  let component: AssetRequestFormComponent;
  let fixture: ComponentFixture<AssetRequestFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AssetRequestFormComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AssetRequestFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
