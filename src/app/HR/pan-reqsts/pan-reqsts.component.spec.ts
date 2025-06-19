import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PanReqstsComponent } from './pan-reqsts.component';

describe('PanReqstsComponent', () => {
  let component: PanReqstsComponent;
  let fixture: ComponentFixture<PanReqstsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PanReqstsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PanReqstsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
