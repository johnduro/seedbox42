import { TestBed } from '@angular/core/testing';

import { TorrentsService } from './torrents.service';

describe('TorrentsService', () => {
  let service: TorrentsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(TorrentsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
