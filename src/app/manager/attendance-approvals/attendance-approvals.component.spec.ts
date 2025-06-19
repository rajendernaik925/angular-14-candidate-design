import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AttendanceApprovalsComponent } from './attendance-approvals.component';

describe('AttendanceApprovalsComponent', () => {
  let component: AttendanceApprovalsComponent;
  let fixture: ComponentFixture<AttendanceApprovalsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AttendanceApprovalsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AttendanceApprovalsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
