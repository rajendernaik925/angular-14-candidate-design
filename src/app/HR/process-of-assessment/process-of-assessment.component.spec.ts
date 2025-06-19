import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ProcessOfAssessmentComponent } from './process-of-assessment.component';

describe('ProcessOfAssessmentComponent', () => {
  let component: ProcessOfAssessmentComponent;
  let fixture: ComponentFixture<ProcessOfAssessmentComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ProcessOfAssessmentComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ProcessOfAssessmentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
