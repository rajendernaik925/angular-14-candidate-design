import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { InOutTimeBarComponent } from './in-out-time-bar.component';

describe('InOutTimeBarComponent', () => {
  let component: InOutTimeBarComponent;
  let fixture: ComponentFixture<InOutTimeBarComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ InOutTimeBarComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(InOutTimeBarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
