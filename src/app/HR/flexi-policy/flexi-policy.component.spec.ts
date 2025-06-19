import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FlexiPolicyComponent } from './flexi-policy.component';

describe('FlexiPolicyComponent', () => {
  let component: FlexiPolicyComponent;
  let fixture: ComponentFixture<FlexiPolicyComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ FlexiPolicyComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FlexiPolicyComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
