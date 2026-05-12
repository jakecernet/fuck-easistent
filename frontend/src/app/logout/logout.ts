import { Component, inject } from '@angular/core';
import { Auth } from '../auth';

@Component({
	selector: 'app-logout',
	imports: [],
	template: '',
})
export class Logout {
	authService = inject(Auth);

	constructor() {
		this.authService.logout();
	}
}
