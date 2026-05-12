import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GradeItem } from './grade-item';

describe('GradeItem', () => {
	let component: GradeItem;
	let fixture: ComponentFixture<GradeItem>;

	beforeEach(async () => {
		await TestBed.configureTestingModule({
			imports: [GradeItem],
		}).compileComponents();

		fixture = TestBed.createComponent(GradeItem);
		component = fixture.componentInstance;
		await fixture.whenStable();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});
});
