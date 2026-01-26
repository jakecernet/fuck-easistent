import { Component, inject, signal } from '@angular/core';
import { Auth } from '../auth';
import { Grades, Grade, SummarizedGrade } from '../services/grades';
import { ServerInfo, ServerInfoData } from '../services/server-info';

@Component({
  selector: 'app-dashboard',
  imports: [],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css',
})
export class Dashboard {
  authService = inject(Auth);
  gradesService = inject(Grades);
  infoService = inject(ServerInfo);

  grades = signal<SummarizedGrade[]>([]);
  info = signal<ServerInfoData | null>(null);

  ngOnInit() {
    this.gradesService.getSummarizedGrades().subscribe((gradesRes) => {
      this.grades.set(gradesRes);
    });
    this.infoService.loadInfoData().subscribe((data) => {
      this.info.set(data);
    });
  }

  getLastCheckTimeFormatted() {
    if (!this.info()) {
      return 'Fetching';
    }

    if (typeof this.info()!.last_check == 'string') {
      return 'Never';
    }
    return this.getTimeFormatted(this.info()?.last_check!);
  }

  getLastFullCheckTimeFormatted() {
    if (!this.info()) {
      return 'Fetching';
    }

    if (typeof this.info()!.last_full_check == 'string') {
      return 'Never';
    }
    console.log(typeof this.info()!.last_full_check);

    return this.getTimeFormatted(this.info()?.last_full_check!);
  }

  getTimeFormatted(epochSeconds: number) {
    const d = new Date(epochSeconds * 1000);

    const pad = (n: any) => n.toString().padStart(2, '0');

    const hh = pad(d.getHours());
    const mm = pad(d.getMinutes());
    const ss = pad(d.getSeconds());

    const dd = pad(d.getDate());
    const MM = pad(d.getMonth() + 1);
    const yyyy = d.getFullYear();

    return `${hh}:${mm}:${ss} ${dd}-${MM}-${yyyy}`;
  }

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

  gradeAverage(): string {
    if (this.grades().length == 0) {
      return "None"
    }

    let sum = 0;

    this.grades().forEach((el) => {
      sum += el.value;
    });


    return (sum / this.grades().length).toFixed(2);
  }

}
