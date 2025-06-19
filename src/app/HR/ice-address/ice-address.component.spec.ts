import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { IceAddressComponent } from './ice-address.component';

describe('IceAddressComponent', () => {
  let component: IceAddressComponent;
  let fixture: ComponentFixture<IceAddressComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ IceAddressComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(IceAddressComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
