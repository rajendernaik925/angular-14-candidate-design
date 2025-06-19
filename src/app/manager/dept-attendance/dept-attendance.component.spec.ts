import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DeptAttendanceComponent } from './dept-attendance.component';

describe('DeptAttendanceComponent', () => {
  let component: DeptAttendanceComponent;
  let fixture: ComponentFixture<DeptAttendanceComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DeptAttendanceComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DeptAttendanceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
