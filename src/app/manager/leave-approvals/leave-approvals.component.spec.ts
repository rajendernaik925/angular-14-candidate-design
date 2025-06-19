import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { LeaveApprovalsComponent } from './leave-approvals.component';

describe('LeaveApprovalsComponent', () => {
  let component: LeaveApprovalsComponent;
  let fixture: ComponentFixture<LeaveApprovalsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ LeaveApprovalsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(LeaveApprovalsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
