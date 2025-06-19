import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PermntAddrssComponent } from './permnt-addrss.component';

describe('PermntAddrssComponent', () => {
  let component: PermntAddrssComponent;
  let fixture: ComponentFixture<PermntAddrssComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PermntAddrssComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PermntAddrssComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
