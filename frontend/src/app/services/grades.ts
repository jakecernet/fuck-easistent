import { inject, Injectable } from '@angular/core';
import { Auth } from '../auth';
import { HttpClient } from '@angular/common/http';
import { catchError, map, Observable, of, throwError } from 'rxjs';
import { environment } from '../../environments/environment';

export class Grade {
	id: number;
	value: number;
	date: Date;
	subject_id: number;
	entered_by: string;
	semester: number;
	type: string;

	constructor(
		id: number,
		value: number,
		date: Date,
		subject_id: number,
		entered_by: string,
		semester: number,
		type: string,
	) {
		this.id = id;
		this.value = value;
		this.subject_id = subject_id;
		this.entered_by = entered_by;
		this.semester = semester;
		this.type = type;
		this.date = new Date(date);
	}
	static fromApi(raw: any): Grade {
		return new Grade(
			raw.id,
			raw.value,
			new Date(raw.date),
			raw.subject_id,
			raw.entered_by,
			raw.semester,
			raw.type,
		);
	}
}

export class Subject {
	id: number;
	short_name: string;
	name: string;
	constructor(id: number, short_name: string, name: string) {
		this.id = id;
		this.short_name = short_name;
		this.name = name;
	}
}

export class SummarizedGrade {
	subject_id: number;
	grade_id: number;
	value: number;
	subject: string;

	constructor(subject_id: number, grade_id: number, value: number, subject: string) {
		this.subject_id = subject_id;
		this.grade_id = grade_id;
		this.value = value;
		this.subject = subject;
	}
}

@Injectable({
	providedIn: 'root',
})
export class Grades {
	authService = inject(Auth);
	http = inject(HttpClient);

	getSubjects(): Observable<Subject[]> {
		return this.http.get<Subject[]>(environment.apiUrl + '/subjects').pipe(
			catchError((err) => {
				if (err.status == 401) {
					this.authService.logout();
				}
				return of([]);
			}),
		);
	}

	getSubject(subject_id: string): Observable<Subject | null> {
		return this.http.get<Subject>(environment.apiUrl + '/subjects/' + subject_id).pipe(
			catchError((err) => {
				if (err.status == 401) {
					this.authService.logout();
				}

				return of(null);
			}),
		);
	}

	getGrades(subject_id: number | null): Observable<Grade[]> {
		return this.http.get<any[]>(environment.apiUrl + '/grades/' + (subject_id ?? '')).pipe(
			map((items) => items.map(Grade.fromApi)),
			catchError((err) => {
				if (err.status == 401) {
					this.authService.logout();
				}
				return of([]);
			}),
		);
	}
	getSummarizedGrades(): Observable<SummarizedGrade[]> {
		return this.http.get<SummarizedGrade[]>(environment.apiUrl + '/summarized_grades').pipe(
			catchError((err) => {
				if (err.status == 401) {
					this.authService.logout();
				}
				return of([]);
			}),
		);
	}
	getAverageGrade(subject_id: number): Observable<number> {
		return this.http.get<any[]>(environment.apiUrl + '/average/' + subject_id).pipe(
			map((res: any) => res['average']),
			catchError((err) => {
				if (err.status == 401) {
					this.authService.logout();
				}
				return of(0.0);
			}),
		);
	}

	addLoginInfo(username: string, password: string): Observable<boolean> {
		return this.http
			.post(environment.apiUrl + '/add-login-data', {
				username: username,
				password: password,
			})
			.pipe(
				map((r) => {
					return true;
				}),
				catchError((r) => {
					return of(false);
				}),
			);
	}

	clearData(): Observable<boolean> {
		return this.http.post<{ success: boolean }>(environment.apiUrl + '/clear_data', {}).pipe(
			map((r) => {
				return r.success;
			}),
			catchError((r) => {
				return of(false);
			}),
		);
	}
}
