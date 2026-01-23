import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GradesForSubject } from './grades-for-subject';

describe('GradesForSubject', () => {
  let component: GradesForSubject;
  let fixture: ComponentFixture<GradesForSubject>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GradesForSubject]
    })
    .compileComponents();

    fixture = TestBed.createComponent(GradesForSubject);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
