import { TestBed } from '@angular/core/testing';

import { Invites } from './invites';

describe('Invites', () => {
  let service: Invites;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(Invites);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
