import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SaturdayPolicyComponent } from './saturday-policy.component';

describe('SaturdayPolicyComponent', () => {
  let component: SaturdayPolicyComponent;
  let fixture: ComponentFixture<SaturdayPolicyComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SaturdayPolicyComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SaturdayPolicyComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
