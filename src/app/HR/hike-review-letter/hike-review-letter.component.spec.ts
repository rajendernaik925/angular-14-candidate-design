import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { HikeReviewLetterComponent } from './hike-review-letter.component';

describe('HikeReviewLetterComponent', () => {
  let component: HikeReviewLetterComponent;
  let fixture: ComponentFixture<HikeReviewLetterComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ HikeReviewLetterComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(HikeReviewLetterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
