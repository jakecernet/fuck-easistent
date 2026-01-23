import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { map, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class Invites {
  private http = inject(HttpClient);

  invites: string[] = [];

  loadInvites(): Observable<string[]> {
    return this.http.get<[{ code_id: number; code: string }]>(environment.apiUrl + '/invites').pipe(
      map((res) => {
        this.invites = [];
        res.forEach((el) => {
          this.invites.push(el.code);
        });
        return this.invites;
      })
    );
  }

  generateInvite(): Observable<string> {
    return this.http
      .post<{ success: boolean; code: string }>(environment.apiUrl + '/create_invite', {})
      .pipe(
        map((res) => {
          return res.code;
        })
      );
  }
  removeInvite(code: string): Observable<any> {
    return this.http.post(environment.apiUrl + '/delete_invite', { code: code });
  }
}
