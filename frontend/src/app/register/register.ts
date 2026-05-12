import { Component, inject, signal } from '@angular/core';
import { form, FormField, minLength, required, submit } from '@angular/forms/signals';
import { Auth } from '../auth';

interface RegisterData {
	username: string;
	password: string;
}

@Component({
	selector: 'app-register',
	imports: [FormField],
	templateUrl: './register.html',
	styleUrl: './register.css',
})
export class Register {
	private authService = inject(Auth);
	show: boolean = false;
	error = signal<string>('');
	loggingIn = signal(false);
	registerModel = signal<RegisterData>({
		username: '',
		password: '',
	});

	registerForm = form(this.registerModel, (fieldPath) => {
		required(fieldPath.username, { message: 'Username is required' });
		minLength(fieldPath.username, 3, { message: 'Username should be at least 3 characters long' });

		required(fieldPath.password, { message: 'Password is required' });
		minLength(fieldPath.password, 8, { message: 'Password should be at least 8 characters' });
	});

	onSubmit(event: Event) {
		event.preventDefault();
		submit(this.registerForm, async () => {
			const credentials = this.registerModel();

			this.loggingIn.set(true);
			this.authService.create_account(credentials.username, credentials.password).subscribe({
				next: (res) => {
					console.log('Ok');
					this.loggingIn.set(false);
				},
				error: (err) => {
					this.loggingIn.set(false);

					if (err.error['message']) {
						this.error.set(err.error['message']);
					} else {
						this.error.set('Something went wrong!');
					}
					console.error(err);
				},
			});
		});
	}

	togglePassword() {
		this.show = !this.show;
	}
}
