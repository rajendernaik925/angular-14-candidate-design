import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ProfileRequestsComponent } from './profile-requests.component';

describe('ProfileRequestsComponent', () => {
  let component: ProfileRequestsComponent;
  let fixture: ComponentFixture<ProfileRequestsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ProfileRequestsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ProfileRequestsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
