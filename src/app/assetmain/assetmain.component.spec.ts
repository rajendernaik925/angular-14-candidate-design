import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AssetmainComponent } from './assetmain.component';

describe('AssetmainComponent', () => {
  let component: AssetmainComponent;
  let fixture: ComponentFixture<AssetmainComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AssetmainComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AssetmainComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
