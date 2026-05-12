import { Component, inject, signal } from '@angular/core';
import { ExamsData, Extra } from '../services/extra';

@Component({
	selector: 'app-exams',
	imports: [],
	templateUrl: './exams.html',
	styleUrl: './exams.css',
})
export class Exams {
	private extra = inject(Extra);
	data = signal<ExamsData | null>(null);
	loading = signal(true);

	ngOnInit() {
		this.extra.exams().subscribe((d) => {
			this.data.set(d);
			this.loading.set(false);
		});
	}
}
