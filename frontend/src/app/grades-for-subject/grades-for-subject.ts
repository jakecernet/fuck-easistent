import { Component, computed, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { Grade, Subject, Grades as GradesService } from '../services/grades';
import { GradeInfo } from './grade-info/grade-info';
import { forkJoin } from 'rxjs';

@Component({
  selector: 'app-grades-for-subject',
  imports: [GradeInfo, RouterLink],
  templateUrl: './grades-for-subject.html',
  styleUrl: './grades-for-subject.css',
})
export class GradesForSubject {
  private route = inject(ActivatedRoute);
  private data = toSignal(this.route.data);
  private gradeService = inject(GradesService);
  subject_id: string = '';
  isLoading = signal(true);
  grades = signal<Grade[]>([]);

  subject = signal<Subject | null>(null);

  //Average grade reported by easistent
  averageGrade = signal(-1);

  ngOnInit() {
    this.subject_id = String(this.route.snapshot.paramMap.get('subject'));
    console.log(this.subject_id);
    this.gradeService.getSubject(this.subject_id).subscribe((res) => {
      this.isLoading.set(false);
      this.subject.set(res);

      if (this.subject() != null) {
        this.gradeService.getGrades(this.subject()!.id).subscribe((res) => {
          this.grades.set(res);
        });
        this.gradeService.getAverageGrade(this.subject()!.id).subscribe((avg) => {
          this.averageGrade.set(avg);
        });
      }
    });
  }

  localAverage() {
    let sum = 0;
    if (this.grades().length == 0) {
      return '0,00';
    }
    this.grades().forEach((r) => {
      sum += r.value;
    });

    let s = String((sum / this.grades().length).toFixed(2));
    return s.replaceAll('.', ',');
  }
}
