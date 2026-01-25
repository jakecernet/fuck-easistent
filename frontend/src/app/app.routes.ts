import { Routes } from '@angular/router';
import { Home } from './home/home';
import { Grades } from './grades/grades';
import { Account } from './account/account';
import { Login } from './login/login';
import { Register } from './register/register';
import { Logout } from './logout/logout';
import { AuthGuard } from './auth/auth-guard';
import { GradesForSubject } from './grades-for-subject/grades-for-subject';
import { Dashboard } from './dashboard/dashboard';

export const routes: Routes = [
  { path: '', component: Home },
  { path: 'login', component: Login },
  { path: 'register', component: Register },
  { path: 'dashboard', component: Dashboard, canActivate: [AuthGuard] },
  { path: 'grades', component: Grades, canActivate: [AuthGuard] },
  { path: 'grades/:subject', component: GradesForSubject, canActivate: [AuthGuard] },
  { path: 'account', component: Account, canActivate: [AuthGuard] },
  { path: 'logout', component: Logout, canActivate: [AuthGuard] },
];
