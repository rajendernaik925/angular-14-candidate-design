import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AttendanceReaderComponent } from './attendance-reader.component';

describe('AttendanceReaderComponent', () => {
  let component: AttendanceReaderComponent;
  let fixture: ComponentFixture<AttendanceReaderComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AttendanceReaderComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AttendanceReaderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
