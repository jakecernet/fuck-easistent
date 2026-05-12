import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GradeInfo } from './grade-info';

describe('GradeInfo', () => {
	let component: GradeInfo;
	let fixture: ComponentFixture<GradeInfo>;

	beforeEach(async () => {
		await TestBed.configureTestingModule({
			imports: [GradeInfo],
		}).compileComponents();

		fixture = TestBed.createComponent(GradeInfo);
		component = fixture.componentInstance;
		await fixture.whenStable();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});
});
