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
  @Input() grades: number[] = [];
  @Input() subject_id: number = 0;

  stringToSaturatedColor(str: string): string {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      hash = str.charCodeAt(i) * 3 + ((hash << 5) - hash);
      hash |= 0;
      hash += 123123;
      hash << 2;
      hash * 23012;
    }

    const hue = Math.abs(hash) % 360;

    const saturation = 60; // High saturation
    const lightness = 40; // Medium lightness

    return `hsl(${hue}, ${saturation}%, ${lightness}%)`;
  }
  getAvg() {
    let sum = 0;
    this.grades.forEach((x) => {
      sum += x;
    });
    if (this.grades.length == 0) {
      return (0.0).toFixed(2);
    }
    return (sum / this.grades.length).toFixed(2);
  }

  openSubjectRoute() {
    this.router.navigate(['grades', this.subject_id]);
  }
}
