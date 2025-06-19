import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DepartmentInfoComponent } from './department-info.component';

describe('DepartmentInfoComponent', () => {
  let component: DepartmentInfoComponent;
  let fixture: ComponentFixture<DepartmentInfoComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DepartmentInfoComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DepartmentInfoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
