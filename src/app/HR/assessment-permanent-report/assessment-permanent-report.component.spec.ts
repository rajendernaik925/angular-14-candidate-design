import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AssessmentPermanentReportComponent } from './assessment-permanent-report.component';

describe('AssessmentPermanentReportComponent', () => {
  let component: AssessmentPermanentReportComponent;
  let fixture: ComponentFixture<AssessmentPermanentReportComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AssessmentPermanentReportComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AssessmentPermanentReportComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
