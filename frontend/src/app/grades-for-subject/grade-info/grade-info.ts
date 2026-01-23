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
    let day = this.grade!.date.getDate();
    let month = this.grade!.date.getMonth() + 1;
    let year = this.grade!.date.getFullYear();

    return `${day}-${month}-${year}`;
  }
}
