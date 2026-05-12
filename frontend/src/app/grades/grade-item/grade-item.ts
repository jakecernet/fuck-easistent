import { Component, inject, Input } from '@angular/core';
import { Router } from '@angular/router';

@Component({
	selector: 'app-grade-item',
	imports: [],
	templateUrl: './grade-item.html',
	styleUrl: './grade-item.css',
})
export class GradeItem {
	private router = inject(Router);

	@Input() subject: string = '';
	@Input() fullName: string = '';
	@Input() grades: number[] = [];
	@Input() finalHalf: number | null = null;
	@Input() finalYear: number | null = null;
	@Input() subject_id: number = 0;

	getAvg() {
		if (this.grades.length === 0) return '—';
		const sum = this.grades.reduce((a, b) => a + b, 0);
		return (sum / this.grades.length).toFixed(2);
	}

	avgColor(): string {
		const n = parseFloat(this.getAvg());
		if (isNaN(n)) return 'var(--text-muted)';
		if (n >= 4.5) return 'var(--primary)';
		if (n >= 3.5) return 'var(--info)';
		if (n >= 2.5) return 'var(--accent)';
		if (n >= 1.5) return 'var(--warn)';
		return 'var(--danger)';
	}

	gradeColor(g: number): string {
		if (g >= 5) return 'var(--primary)';
		if (g >= 4) return 'var(--info)';
		if (g >= 3) return 'var(--accent)';
		if (g >= 2) return 'var(--warn)';
		return 'var(--danger)';
	}

	openSubjectRoute() {
		this.router.navigate(['grades', this.subject_id]);
	}
}
