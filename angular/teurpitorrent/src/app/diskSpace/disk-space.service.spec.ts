import { TestBed } from '@angular/core/testing';

import { DiskSpaceService } from './disk-space.service';

describe('DiskSpaceService', () => {
  let service: DiskSpaceService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(DiskSpaceService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
