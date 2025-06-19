import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EmployeeAssertModuleComponent } from './employee-assert-module.component';

describe('EmployeeAssertModuleComponent', () => {
  let component: EmployeeAssertModuleComponent;
  let fixture: ComponentFixture<EmployeeAssertModuleComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ EmployeeAssertModuleComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EmployeeAssertModuleComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
