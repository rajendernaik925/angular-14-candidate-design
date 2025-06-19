import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AssetItAdminComponent } from './asset-it-admin.component';

describe('AssetItAdminComponent', () => {
  let component: AssetItAdminComponent;
  let fixture: ComponentFixture<AssetItAdminComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AssetItAdminComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AssetItAdminComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
