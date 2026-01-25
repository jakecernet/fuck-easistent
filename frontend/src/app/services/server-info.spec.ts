import { TestBed } from '@angular/core/testing';

import { ServerInfo } from './server-info';

describe('ServerInfo', () => {
  let service: ServerInfo;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ServerInfo);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
