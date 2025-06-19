import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PromotionLetterComponent } from './promotion-letter.component';

describe('PromotionLetterComponent', () => {
  let component: PromotionLetterComponent;
  let fixture: ComponentFixture<PromotionLetterComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PromotionLetterComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PromotionLetterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
