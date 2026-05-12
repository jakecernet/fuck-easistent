import { Component, computed, inject, signal } from '@angular/core';
import { Extra, TimetableData, TimetableHour } from '../services/extra';

interface EventVariant {
  name: string;
  teacher?: string;
  classroom?: string;
  color?: string;
  group?: string;
}

interface DisplayEvent {
  from: string;
  to: string;
  completed: boolean;
  isNow: boolean;
  variants: EventVariant[];
}

interface DayCol {
  date: string;
  name: string;
  shortName: string;
  isToday: boolean;
  events: DisplayEvent[];
}

function toIsoDate(d: Date): string {
  const pad = (n: number) => n.toString().padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

function mondayOf(d: Date): Date {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  const dow = x.getDay() || 7;
  x.setDate(x.getDate() - (dow - 1));
  return x;
}

@Component({
  selector: 'app-timetable',
  imports: [],
  templateUrl: './timetable.html',
  styleUrl: './timetable.css',
})
export class Timetable {
  private extra = inject(Extra);
  data = signal<TimetableData | null>(null);
  loading = signal(true);
  weekStart = signal<Date>(mondayOf(new Date()));
  selectedDayIdx = signal<number>(this.todayDow());
  now = signal<Date>(new Date());
  private nowTimer: any;

  todayDow(): number {
    const dow = new Date().getDay();
    return dow === 0 ? 4 : Math.min(dow - 1, 4);
  }

  weekLabel = computed(() => {
    const s = this.weekStart();
    const e = new Date(s);
    e.setDate(s.getDate() + 4);
    const fmt = (d: Date) =>
      `${d.getDate().toString().padStart(2, '0')}.${(d.getMonth() + 1).toString().padStart(2, '0')}.`;
    return `${fmt(s)} – ${fmt(e)}${e.getFullYear() !== new Date().getFullYear() ? ' ' + e.getFullYear() : ''}`;
  });

  isCurrentWeek = computed(
    () => toIsoDate(this.weekStart()) === toIsoDate(mondayOf(new Date())),
  );

  days = computed<DayCol[]>(() => {
    const d = this.data();
    this.now();
    if (!d) return [];

    const hourById = new Map<number, TimetableHour>();
    for (const h of d.time_table ?? []) hourById.set(h.id, h);

    const todayIso = toIsoDate(new Date());
    const nowMin = this.now().getHours() * 60 + this.now().getMinutes();

    const result: DayCol[] = [];
    for (const day of d.day_table ?? []) {
      // Group parallel events by (from_id, to_id) within same date
      const slots = new Map<string, any[]>();
      for (const ev of d.school_hour_events ?? []) {
        if (ev.time?.date !== day.date) continue;
        const key = `${ev.time.from_id}_${ev.time.to_id}`;
        if (!slots.has(key)) slots.set(key, []);
        slots.get(key)!.push(ev);
      }

      const events: DisplayEvent[] = [];
      for (const [key, parallel] of slots) {
        const [fromIdStr] = key.split('_');
        const from = hourById.get(parseInt(fromIdStr));
        const to = hourById.get(parallel[0].time.to_id);
        const fromStr = from?.time.from ?? '';
        const toStr = to?.time.to ?? '';

        let isNow = false;
        if (day.date === todayIso && fromStr && toStr) {
          const [fh, fm] = fromStr.split(':').map(Number);
          const [th, tm] = toStr.split(':').map(Number);
          const start = fh * 60 + fm;
          const end = th * 60 + tm;
          isNow = nowMin >= start && nowMin < end;
        }

        const variants: EventVariant[] = parallel.map((ev: any, i: number) => ({
          name: ev.subject?.name ?? '—',
          teacher: ev.teachers?.[0]?.name,
          classroom: ev.classroom?.name,
          color: ev.color,
          group: parallel.length > 1 ? `Skupina ${i + 1}` : undefined,
        }));

        // Consistent ordering by teacher name so it doesn't flip between fetches
        if (variants.length > 1) {
          variants.sort((a, b) => (a.teacher ?? '').localeCompare(b.teacher ?? ''));
          variants.forEach((v, i) => (v.group = `Skupina ${i + 1}`));
        }

        events.push({
          from: fromStr,
          to: toStr,
          completed: parallel.every((p: any) => p.completed),
          isNow,
          variants,
        });
      }
      events.sort((a, b) => a.from.localeCompare(b.from));
      result.push({
        date: day.date,
        name: day.name,
        shortName: day.short_name || day.name.slice(0, 3),
        isToday: day.date === todayIso,
        events,
      });
    }
    return result;
  });

  hasAnyEvents = computed(() => this.days().some((d) => d.events.length > 0));

  ngOnInit() {
    this.fetch();
    this.nowTimer = setInterval(() => this.now.set(new Date()), 60_000);
  }

  ngOnDestroy() {
    clearInterval(this.nowTimer);
  }

  private fetch() {
    this.loading.set(true);
    this.extra.timetable(toIsoDate(this.weekStart())).subscribe((d) => {
      this.data.set(d);
      this.loading.set(false);
    });
  }

  prevWeek() {
    const d = new Date(this.weekStart());
    d.setDate(d.getDate() - 7);
    this.weekStart.set(d);
    this.fetch();
  }

  nextWeek() {
    const d = new Date(this.weekStart());
    d.setDate(d.getDate() + 7);
    this.weekStart.set(d);
    this.fetch();
  }

  thisWeek() {
    this.weekStart.set(mondayOf(new Date()));
    this.selectedDayIdx.set(this.todayDow());
    this.fetch();
  }

  selectDay(i: number) {
    this.selectedDayIdx.set(i);
  }

  shortDate(iso: string): string {
    const d = new Date(iso);
    const pad = (n: number) => n.toString().padStart(2, '0');
    return `${pad(d.getDate())}.${pad(d.getMonth() + 1)}.`;
  }
}
