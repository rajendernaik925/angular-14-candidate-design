import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PayslipsuploadsComponent } from './payslipsuploads.component';

describe('PayslipsuploadsComponent', () => {
  let component: PayslipsuploadsComponent;
  let fixture: ComponentFixture<PayslipsuploadsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PayslipsuploadsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PayslipsuploadsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
