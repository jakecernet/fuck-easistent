import {
  HttpClient,
  HttpEvent,
  HttpEventType,
  HttpHandler,
  HttpHandlerFn,
  HttpHeaders,
  HttpInterceptor,
  HttpParams,
  HttpRequest,
} from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { environment } from '../environments/environment';
import { catchError, map, Observable, of, tap } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class Auth {
  private router = inject(Router);
  private http = inject(HttpClient);
  private token = '';
  private username = '';

  constructor() {
    if (this.hasToken()) {
      this.token = localStorage.getItem('token') ?? '';
      this.username = localStorage.getItem('username') ?? '';
    }
  }

  hasToken() {
    return localStorage.getItem('token') != null;
  }
  getToken() {
    return this.token;
  }
  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('username');
    this.token = '';
    this.username = '';
    this.router.navigate(['/login']);
  }
  isLoggedIn() {
    return this.token.length > 0;
  }
  login(username: string, password: string): Observable<any> {
    const body = new HttpParams().set('username', username).set('password', password);
    return this.http
      .post(environment.apiUrl + '/login', body.toString(), {
        headers: new HttpHeaders().set('Content-Type', 'application/x-www-form-urlencoded'),
      })
      .pipe(
        tap((response) => {
          localStorage.setItem('token', (response as any).access_token);
          this.token = (response as any).access_token;
          this.http.get(environment.apiUrl + '/user').subscribe((res) => {
            this.username = (res as any).username;
            localStorage.setItem('username', this.username);
            this.router.navigate(['/']);
          });
        }),
      );
  }

  getUsername() {
    return this.username;
  }

  create_account(username: string, password: string): Observable<any> {
    const body = new HttpParams().set('username', username).set('password', password);
    return this.http
      .post(environment.apiUrl + '/create-user', body.toString(), {
        headers: new HttpHeaders().set('Content-Type', 'application/x-www-form-urlencoded'),
      })
      .pipe(
        tap((response) => {
          this.router.navigate(['/login']);
        }),
      );
  }
  deleteAccount(): Observable<boolean> {
    return this.http.post<{ success: boolean }>(environment.apiUrl + '/delete_user', {}, {}).pipe(
      tap((response) => {
        if (response.success) {
          this.logout();
        }
      }),
      map((res) => {
        return res.success;
      }),
      catchError((err) => {
        return of(false);
      }),
    );
  }
}

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  private authService = inject(Auth);
  intercept(req: HttpRequest<any>, handler: HttpHandler): Observable<HttpEvent<any>> {
    console.log('Intercepted');
    if (this.authService.isLoggedIn()) {
      let token = this.authService.getToken();
      req = req.clone({
        setHeaders: {
          Authorization: `Bearer ${token}`,
        },
      });
      console.log('added auth');
    }
    return handler.handle(req);
  }
}
