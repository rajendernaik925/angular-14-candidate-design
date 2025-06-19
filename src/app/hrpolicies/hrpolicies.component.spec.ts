import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { HRpoliciesComponent } from './hrpolicies.component';

describe('HRpoliciesComponent', () => {
  let component: HRpoliciesComponent;
  let fixture: ComponentFixture<HRpoliciesComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ HRpoliciesComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(HRpoliciesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
