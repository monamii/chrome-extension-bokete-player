import { TestBed } from '@angular/core/testing';

import { FullCalendarService } from './full-calendar.service';

describe('FullCalendarService', () => {
  let service: FullCalendarService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(FullCalendarService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
