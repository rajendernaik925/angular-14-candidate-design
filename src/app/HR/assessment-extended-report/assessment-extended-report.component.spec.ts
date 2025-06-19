import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AssessmentExtendedReportComponent } from './assessment-extended-report.component';

describe('AssessmentExtendedReportComponent', () => {
  let component: AssessmentExtendedReportComponent;
  let fixture: ComponentFixture<AssessmentExtendedReportComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AssessmentExtendedReportComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AssessmentExtendedReportComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
