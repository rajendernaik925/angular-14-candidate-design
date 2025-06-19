import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { EmployeeHikeLetterComponent } from './employee-hike-letter.component';

describe('EmployeeHikeLetterComponent', () => {
  let component: EmployeeHikeLetterComponent;
  let fixture: ComponentFixture<EmployeeHikeLetterComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ EmployeeHikeLetterComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EmployeeHikeLetterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
