import { TestBed } from '@angular/core/testing';

import { videoService } from './auto-tag.service';

describe('AutoTagService', () => {
  let service: videoService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(videoService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
