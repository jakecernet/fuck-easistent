import { inject, Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { Auth } from '../auth';

@Injectable({ providedIn: 'root' })
export class AuthGuard implements CanActivate {
	private authService = inject(Auth);
	private router = inject(Router);

	canActivate(): boolean {
		if (this.authService.isLoggedIn()) {
			return true;
		}

		this.router.navigate(['/login']);
		return false;
	}
}
