import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AttendanceReportAssamComponent } from './attendance-report-assam.component';

describe('AttendanceReportAssamComponent', () => {
  let component: AttendanceReportAssamComponent;
  let fixture: ComponentFixture<AttendanceReportAssamComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AttendanceReportAssamComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AttendanceReportAssamComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
