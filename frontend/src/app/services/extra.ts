import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { catchError, Observable, of } from 'rxjs';
import { environment } from '../../environments/environment';
import { Auth } from '../auth';

export interface Stats {
	average: number | null;
	grade_count: number;
	finals_half: number;
	finals_year: number;
	subject_count: number;
	by_value: Record<string, number>;
}

export interface AbsenceHour {
	class_name: string;
	class_short_name: string;
	value: string;
	from: string;
	to: string;
	state: string;
}

export interface Absence {
	id: number;
	date: string;
	missing_count: number;
	excused_count: number;
	not_excused_count: number;
	state: string;
	seen: boolean;
	excuse_sent: boolean;
	excuse_description: string | null;
	excuse_written_date: string | null;
	hours: AbsenceHour[];
	attachments: any[];
}

export interface AbsencesData {
	summary: {
		pending_hours: number;
		excused_hours: number;
		unexcused_hours: number;
		unmanaged_absences: number;
	};
	items: Absence[];
}

export interface ExamsData {
	submitted_exams: any[];
	upcoming_exams: any[];
}

export interface HomeworkData {
	items: any[];
}

export interface TimetableHour {
	id: number;
	name: string;
	name_short: string;
	time: { from: string; to: string };
	type: 'default' | 'break' | string;
}

export interface TimetableDay {
	name: string;
	short_name: string;
	date: string;
}

export interface TimetableEvent {
	event_id: number;
	color?: string;
	completed?: boolean;
	hour_special_type?: string | null;
	time: { from_id: number; to_id: number; date: string };
	subject?: { id: string; name: string };
	teachers?: { id: string; name: string }[];
	classroom?: { id: string; name: string };
	departments?: { id: string; name: string }[];
	groups?: { id: string; name: string }[];
	info?: any[];
}

export interface TimetableData {
	time_table: TimetableHour[];
	day_table: TimetableDay[];
	school_hour_events: TimetableEvent[];
	events?: any[];
	all_day_events?: any[];
}

@Injectable({ providedIn: 'root' })
export class Extra {
	private http = inject(HttpClient);
	private auth = inject(Auth);

	private wrap<T>(o: Observable<T>, fallback: T): Observable<T> {
		return o.pipe(
			catchError((err) => {
				if (err.status === 401) this.auth.logout();
				return of(fallback);
			}),
		);
	}

	stats(): Observable<Stats | null> {
		return this.wrap(this.http.get<Stats>(environment.apiUrl + '/stats'), null);
	}

	refresh(): Observable<{ success: boolean } | null> {
		return this.wrap(
			this.http.post<{ success: boolean }>(environment.apiUrl + '/refresh', {}),
			null,
		);
	}

	absences(): Observable<AbsencesData | null> {
		return this.wrap(this.http.get<AbsencesData>(environment.apiUrl + '/absences'), null);
	}

	exams(): Observable<ExamsData | null> {
		return this.wrap(this.http.get<ExamsData>(environment.apiUrl + '/exams'), null);
	}

	homework(): Observable<HomeworkData | null> {
		return this.wrap(this.http.get<HomeworkData>(environment.apiUrl + '/homework'), null);
	}

	timetable(weekStartIso?: string): Observable<TimetableData | null> {
		const q = weekStartIso ? `?week=${weekStartIso}` : '';
		return this.wrap(this.http.get<TimetableData>(environment.apiUrl + '/timetable' + q), null);
	}
}
