import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GradeCreator } from './grade-creator';

describe('GradeCreator', () => {
  let component: GradeCreator;
  let fixture: ComponentFixture<GradeCreator>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GradeCreator]
    })
    .compileComponents();

    fixture = TestBed.createComponent(GradeCreator);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
