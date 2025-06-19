import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MngrAssesmentFormComponent } from './mngr-assesment-form.component';

describe('MngrAssesmentFormComponent', () => {
  let component: MngrAssesmentFormComponent;
  let fixture: ComponentFixture<MngrAssesmentFormComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MngrAssesmentFormComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MngrAssesmentFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
