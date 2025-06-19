import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { UnfreezeDatesComponent } from './unfreeze-dates.component';

describe('UnfreezeDatesComponent', () => {
  let component: UnfreezeDatesComponent;
  let fixture: ComponentFixture<UnfreezeDatesComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ UnfreezeDatesComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(UnfreezeDatesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
