import { TestBed } from '@angular/core/testing';

import { Sweetalert2 } from './sweetalert2';

describe('Sweetalert2', () => {
  let service: Sweetalert2;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(Sweetalert2);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
