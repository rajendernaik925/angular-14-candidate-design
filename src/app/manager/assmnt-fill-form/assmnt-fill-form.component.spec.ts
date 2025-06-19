import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AssmntFillFormComponent } from './assmnt-fill-form.component';

describe('AssmntFillFormComponent', () => {
  let component: AssmntFillFormComponent;
  let fixture: ComponentFixture<AssmntFillFormComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AssmntFillFormComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AssmntFillFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
