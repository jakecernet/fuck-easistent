import { Component, computed, inject, signal } from '@angular/core';
import { Auth } from '../auth';
import { Grades, SummarizedGrade } from '../services/grades';
import { ServerInfo, ServerInfoData } from '../services/server-info';
import { Router, RouterLink } from '@angular/router';
import { Extra, Stats, AbsencesData } from '../services/extra';

@Component({
  selector: 'app-dashboard',
  imports: [RouterLink],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css',
})
export class Dashboard {
  authService = inject(Auth);
  gradesService = inject(Grades);
  infoService = inject(ServerInfo);
  extraService = inject(Extra);
  router = inject(Router);

  grades = signal<SummarizedGrade[]>([]);
  info = signal<ServerInfoData | null>(null);
  stats = signal<Stats | null>(null);
  absences = signal<AbsencesData | null>(null);

  recentGrades = computed(() => this.grades().slice(0, 10));

  ngOnInit() {
    this.gradesService.getSummarizedGrades().subscribe((g) => this.grades.set(g));
    this.infoService.loadInfoData().subscribe((d) => this.info.set(d));
    this.extraService.stats().subscribe((s) => this.stats.set(s));
    this.extraService.absences().subscribe((a) => this.absences.set(a));
  }

  lastCheck(): string {
    const info = this.info();
    if (!info) return '…';
    if (typeof info.last_check === 'string' || info.last_check == null) return 'nikoli';
    return this.timeAgo(info.last_check);
  }

  timeAgo(epochSeconds: number): string {
    const diff = Math.floor(Date.now() / 1000 - epochSeconds);
    if (diff < 60) return 'pravkar';
    if (diff < 3600) return `pred ${Math.floor(diff / 60)} min`;
    if (diff < 86400) return `pred ${Math.floor(diff / 3600)} h`;
    return `pred ${Math.floor(diff / 86400)} dni`;
  }

  gradeColor(value: number): string {
    if (value >= 5) return 'var(--primary)';
    if (value >= 4) return 'var(--info)';
    if (value >= 3) return 'var(--accent)';
    if (value >= 2) return 'var(--warn)';
    return 'var(--danger)';
  }

  openSubject(id: number) {
    this.router.navigate(['grades', id]);
  }
}
