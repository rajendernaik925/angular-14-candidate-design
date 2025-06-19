import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { JobcodeComponent } from './jobcode.component';

describe('JobcodeComponent', () => {
  let component: JobcodeComponent;
  let fixture: ComponentFixture<JobcodeComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ JobcodeComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(JobcodeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
