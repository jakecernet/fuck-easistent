import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export class ServerInfoData {
  last_check: number | null;
  last_full_check: number | null;

  constructor(last_check: number | null, last_full_check: number | null) {
    this.last_check = last_check;
    this.last_full_check = last_full_check;
  }
}

@Injectable({
  providedIn: 'root',
})
export class ServerInfo {
  private http = inject(HttpClient);

  loadInfoData(): Observable<ServerInfoData> {
    return this.http.get<ServerInfoData>(environment.apiUrl + '/info');
  }
}
