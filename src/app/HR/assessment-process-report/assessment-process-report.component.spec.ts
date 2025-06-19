import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AssessmentProcessReportComponent } from './assessment-process-report.component';

describe('AssessmentProcessReportComponent', () => {
  let component: AssessmentProcessReportComponent;
  let fixture: ComponentFixture<AssessmentProcessReportComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AssessmentProcessReportComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AssessmentProcessReportComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
