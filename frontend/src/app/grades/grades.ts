import { Component, inject, signal } from '@angular/core';
import { GradeItem } from './grade-item/grade-item';
import { Grade, Subject, Grades as GradesService } from '../services/grades';
import { forkJoin, map } from 'rxjs';
import { Auth } from '../auth';

class SubjectGrade {
  subject: Subject;
  grades: Grade[];

  constructor(subject: Subject, grades: Grade[]) {
    this.subject = subject;
    this.grades = grades;
  }

  private isFinal(g: Grade) {
    return (g.type || '').toLowerCase().startsWith('zaklju');
  }

  getRegular(): Grade[] {
    return this.grades.filter((g) => !this.isFinal(g));
  }

  getRegularValues(): number[] {
    return this.getRegular().map((g) => g.value);
  }

  getFinalHalf(): number | null {
    const f = this.grades.find((g) => g.type === 'Zaključena polletna');
    return f ? f.value : null;
  }

  getFinalYear(): number | null {
    const f = this.grades.find((g) => g.type === 'Zaključena letna');
    return f ? f.value : null;
  }
}

@Component({
  selector: 'app-grades',
  imports: [GradeItem],
  templateUrl: './grades.html',
  styleUrl: './grades.css',
})
export class Grades {
  private gradeService = inject(GradesService);
  authService = inject(Auth);
  gradesMap = signal<SubjectGrade[]>([]);

  constructor() {
    this.gradeService.getSubjects().subscribe((subjects) => {
      const obs = subjects.map((subj) =>
        this.gradeService.getGrades(subj.id).pipe(map((grades) => new SubjectGrade(subj, grades))),
      );
      forkJoin(obs).subscribe((res) => this.gradesMap.set(res));
    });
  }
}
