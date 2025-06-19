import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MastercreationComponent } from './mastercreation.component';

describe('MastercreationComponent', () => {
  let component: MastercreationComponent;
  let fixture: ComponentFixture<MastercreationComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MastercreationComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MastercreationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
