import { Component, inject, signal } from '@angular/core';
import { NgClass } from '@angular/common';
import { RouterLink } from '@angular/router';
import { AbsencesData, Extra } from '../services/extra';

@Component({
  selector: 'app-absences',
  imports: [NgClass, RouterLink],
  templateUrl: './absences.html',
  styleUrl: './absences.css',
})
export class Absences {
  private extra = inject(Extra);
  data = signal<AbsencesData | null>(null);
  loading = signal(true);

  ngOnInit() {
    this.extra.absences().subscribe((d) => {
      this.data.set(d);
      this.loading.set(false);
    });
  }

  formatDate(iso: string): string {
    const d = new Date(iso);
    const pad = (n: number) => n.toString().padStart(2, '0');
    return `${pad(d.getDate())}.${pad(d.getMonth() + 1)}.${d.getFullYear()}`;
  }

  weekday(iso: string): string {
    const days = ['nedelja', 'ponedeljek', 'torek', 'sreda', 'četrtek', 'petek', 'sobota'];
    return days[new Date(iso).getDay()];
  }

  stateLabel(s: string): string {
    return {
      excused: 'opravičeno',
      not_excused: 'neopravičeno',
      pending: 'v postopku',
      managed: 'urejeno',
    }[s] || s;
  }

  stateClass(s: string): string {
    return {
      excused: '',
      not_excused: 'danger',
      pending: 'warn',
    }[s] || 'muted';
  }
}
