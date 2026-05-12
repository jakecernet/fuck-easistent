import { Component, inject, signal } from '@angular/core';
import { Extra, HomeworkData } from '../services/extra';

@Component({
  selector: 'app-homework',
  imports: [],
  templateUrl: './homework.html',
  styleUrl: './homework.css',
})
export class Homework {
  private extra = inject(Extra);
  data = signal<HomeworkData | null>(null);
  loading = signal(true);

  ngOnInit() {
    this.extra.homework().subscribe((d) => {
      this.data.set(d);
      this.loading.set(false);
    });
  }
}
