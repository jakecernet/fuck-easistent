import { Routes } from '@angular/router';
import { Grades } from './grades/grades';
import { Account } from './account/account';
import { Login } from './login/login';
import { Register } from './register/register';
import { Logout } from './logout/logout';
import { AuthGuard } from './auth/auth-guard';
import { GradesForSubject } from './grades-for-subject/grades-for-subject';
import { Dashboard } from './dashboard/dashboard';
import { Absences } from './absences/absences';
import { Exams } from './exams/exams';
import { Homework } from './homework/homework';
import { Timetable } from './timetable/timetable';

export const routes: Routes = [
  { path: '', component: Dashboard, canActivate: [AuthGuard] },
  { path: 'login', component: Login },
  { path: 'register', component: Register },
  { path: 'grades', component: Grades, canActivate: [AuthGuard] },
  { path: 'grades/:subject', component: GradesForSubject, canActivate: [AuthGuard] },
  { path: 'absences', component: Absences, canActivate: [AuthGuard] },
  { path: 'exams', component: Exams, canActivate: [AuthGuard] },
  { path: 'homework', component: Homework, canActivate: [AuthGuard] },
  { path: 'timetable', component: Timetable, canActivate: [AuthGuard] },
  { path: 'account', component: Account, canActivate: [AuthGuard] },
  { path: 'logout', component: Logout, canActivate: [AuthGuard] },
];
