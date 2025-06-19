import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { VaccineRegComponent } from './vaccine-reg.component';

describe('VaccineRegComponent', () => {
  let component: VaccineRegComponent;
  let fixture: ComponentFixture<VaccineRegComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ VaccineRegComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(VaccineRegComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
