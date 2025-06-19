import { TestBed } from '@angular/core/testing';

import { NgIdleServiceService } from './ng-idle-service.service';

describe('NgIdleServiceService', () => {
  let service: NgIdleServiceService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(NgIdleServiceService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
