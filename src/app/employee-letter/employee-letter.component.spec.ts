import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { EmployeeLetterComponent } from './employee-letter.component';

describe('EmployeeLetterComponent', () => {
  let component: EmployeeLetterComponent;
  let fixture: ComponentFixture<EmployeeLetterComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ EmployeeLetterComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EmployeeLetterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
