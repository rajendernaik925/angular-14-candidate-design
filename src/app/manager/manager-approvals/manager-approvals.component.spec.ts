import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ManagerApprovalsComponent } from './manager-approvals.component';

describe('ManagerApprovalsComponent', () => {
  let component: ManagerApprovalsComponent;
  let fixture: ComponentFixture<ManagerApprovalsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ManagerApprovalsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ManagerApprovalsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
