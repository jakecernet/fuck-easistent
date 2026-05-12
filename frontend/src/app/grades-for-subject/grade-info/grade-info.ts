import { Component, Input } from '@angular/core';
import { Grade } from '../../services/grades';

@Component({
	selector: 'app-grade-info',
	imports: [],
	templateUrl: './grade-info.html',
	styleUrl: './grade-info.css',
})
export class GradeInfo {
	@Input() grade: Grade | null = null;

	getDateFormatted() {
		const d = this.grade!.date;
		const pad = (n: number) => n.toString().padStart(2, '0');
		return `${pad(d.getDate())}.${pad(d.getMonth() + 1)}.${d.getFullYear()}`;
	}

	valueColor() {
		const v = this.grade?.value ?? 0;
		if (v >= 5) return 'var(--primary)';
		if (v >= 4) return 'var(--info)';
		if (v >= 3) return 'var(--accent)';
		if (v >= 2) return 'var(--warn)';
		return 'var(--danger)';
	}
}
