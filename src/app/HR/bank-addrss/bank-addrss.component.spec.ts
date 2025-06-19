import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { BankAddrssComponent } from './bank-addrss.component';

describe('BankAddrssComponent', () => {
  let component: BankAddrssComponent;
  let fixture: ComponentFixture<BankAddrssComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ BankAddrssComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(BankAddrssComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
