import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ReviewLetterComponent } from './review-letter.component';

describe('ReviewLetterComponent', () => {
  let component: ReviewLetterComponent;
  let fixture: ComponentFixture<ReviewLetterComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ReviewLetterComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ReviewLetterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
