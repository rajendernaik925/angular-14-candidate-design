import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { BusinessUnitAttendanceComponent } from './business-unit-attendance.component';

describe('BusinessUnitAttendanceComponent', () => {
  let component: BusinessUnitAttendanceComponent;
  let fixture: ComponentFixture<BusinessUnitAttendanceComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ BusinessUnitAttendanceComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(BusinessUnitAttendanceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
