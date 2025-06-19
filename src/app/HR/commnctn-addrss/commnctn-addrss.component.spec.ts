import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CommnctnAddrssComponent } from './commnctn-addrss.component';

describe('CommnctnAddrssComponent', () => {
  let component: CommnctnAddrssComponent;
  let fixture: ComponentFixture<CommnctnAddrssComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CommnctnAddrssComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CommnctnAddrssComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
