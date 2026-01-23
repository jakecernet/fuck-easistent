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

  getAverage() {
    let sum: number = 0;
    this.grades.forEach((g) => {
      sum += g.value;
    });
    return (sum / this.grades.length).toFixed(2);
  }

  getGradeValues(): number[] {
    return this.grades.map((x) => x.value);
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
  _gradesMap: SubjectGrade[] = [];

  constructor() {
    console.log('loading');
    this.gradeService.getSubjects().subscribe((subjects) => {
      // Create an array of observables to get grades for each subject
      const gradesObservables = subjects.map((subj) =>
        this.gradeService.getGrades(subj.id).pipe(map((grades) => new SubjectGrade(subj, grades)))
      );

      // Wait until all observables complete
      forkJoin(gradesObservables).subscribe((subjectGrades) => {
        this.gradesMap.set(subjectGrades);
        console.log(subjectGrades);
      });
    });
  }
}
